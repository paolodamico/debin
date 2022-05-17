// TODO: Convert to typescript and add compiling
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

function errorResponse(message, code, statusCode) {
  return new Response(JSON.stringify({ message, code }), {
    status: statusCode,
    headers: new Headers(baseHeaders),
  });
}

async function handleRequest(request) {
  const { method, headers } = request;
  const contentType = headers.get("content-type") || "";

  if (method === "OPTIONS") {
    return new Response(undefined, { headers: new Headers(baseHeaders) });
  }

  if (method !== "POST") {
    return errorResponse("Method Not Allowed", "method_not_allowed", 405);
  }

  if (contentType !== "application/json") {
    return errorResponse(
      "Only JSON requests are allowed.",
      "unsupported_media_type",
      415
    );
  }

  const { content, iv } = await request.json();

  if (!content) {
    return errorResponse(
      "`content` attribute is always required.",
      "required",
      400
    );
  }

  const storedObject = { timestamp: new Date().getTime(), content, iv };
  const json = JSON.stringify(storedObject);
  const blob = new Blob([json], { type: "text/json" });

  const body = new FormData();
  body.append("file", blob);

  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    body,
    headers: new Headers({
      Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Error uploading file to IPFS. Response from web3.storage: ${await response.text()}`
    );
  }

  const { cid } = await response.json();

  return new Response(JSON.stringify({ cid }), {
    headers: new Headers(baseHeaders),
  });
}
