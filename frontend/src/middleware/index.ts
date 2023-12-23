import { sequence } from "astro:middleware";

import securityHeaders from "./securityHeaders";
import logger from "./logger";

const middleware = () => sequence(logger, securityHeaders);

export const onRequest = middleware();
