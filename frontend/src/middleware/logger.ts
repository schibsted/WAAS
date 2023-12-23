import { defineMiddleware } from "astro:middleware";

const logger = defineMiddleware(async ({ request }, next) => {
  const { pathname, searchParams } = new URL(request.url);

  let requestUri = pathname;
  if (searchParams.toString()) {
    requestUri += `?${searchParams.toString()}`;
  }

  const response = await next();
  const timestamp = new Date().toISOString();

  console.log(
    `[${timestamp}] ${request.method} ${response.status} ${requestUri}`
  );

  return response;
});

export default logger;
