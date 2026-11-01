import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const required = [
  "GDRIVE_CLIENT_ID",
  "GDRIVE_CLIENT_SECRET",
  "GDRIVE_REFRESH_TOKEN",
  "GDRIVE_FOLDER_ID",
];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required GitHub Secret: ${key}`);
}

async function checkedFetch(url, options, label) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = (await response.text()).slice(0, 1200);
    throw new Error(`${label} failed (HTTP ${response.status}): ${body}`);
  }
  return response;
}

const tokenResponse = await checkedFetch(
  "https://oauth2.googleapis.com/token",
  {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GDRIVE_CLIENT_ID,
      client_secret: process.env.GDRIVE_CLIENT_SECRET,
      refresh_token: process.env.GDRIVE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  },
  "Google OAuth refresh",
);
const { access_token } = await tokenResponse.json();
if (!access_token) throw new Error("Google OAuth response did not contain an access token");

const directory = process.argv[2] ?? "backup";
const names = (await readdir(directory)).sort();
if (names.length !== 3) {
  throw new Error(`Expected exactly 3 backup files, found ${names.length}`);
}

for (const name of names) {
  const path = join(directory, name);
  const info = await stat(path);
  if (!info.isFile() || info.size === 0) throw new Error(`Invalid or empty backup file: ${name}`);

  const metadata = {
    name: `${new Date().toISOString().replaceAll(":", "-")}-${name}`,
    mimeType: "application/octet-stream",
    parents: [process.env.GDRIVE_FOLDER_ID],
    description: `CerdikChat repository backup; commit ${process.env.GITHUB_SHA ?? "manual"}`,
  };

  const session = await checkedFetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,webViewLink",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${access_token}`,
        "content-type": "application/json; charset=UTF-8",
        "x-upload-content-type": "application/octet-stream",
        "x-upload-content-length": String(info.size),
      },
      body: JSON.stringify(metadata),
    },
    `Drive upload session for ${name}`,
  );
  const sessionUrl = session.headers.get("location");
  if (!sessionUrl) throw new Error(`Google Drive did not return an upload session for ${name}`);

  const bytes = await readFile(path);
  const uploaded = await checkedFetch(
    sessionUrl,
    {
      method: "PUT",
      headers: {
        "content-type": "application/octet-stream",
        "content-length": String(bytes.length),
      },
      body: bytes,
    },
    `Drive upload for ${name}`,
  );
  const result = await uploaded.json();
  if (!result.id || Number(result.size) !== info.size) {
    throw new Error(`Drive verification failed for ${name}: missing ID or size mismatch`);
  }
  console.log(`Uploaded and size-verified: ${name} (${result.size} bytes), Drive ID ${result.id}`);
}
