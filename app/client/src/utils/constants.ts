/* Constants */
// Define Constants for HTTP methods
export const GET = "GET";
export const POST = "POST";
export const PUT = "PUT";
export const DELETE = "DELETE";
export const PATCH = "PATCH";

// HTTP status codes
export const OK = 200;
export const FORBIDDEN = 403;
export const METHOD_NOT_ALLOWED = 405;
export const INTERNAL_SERVER_ERROR = 500;

// Rating values
export const RATING_CORRECT_ANSWER = "1";
export const RATING_WRONG_ANSWER = "-1";

// Define constant values
export const TYPING_DELAY = 3000;
export const CHUNK_SIZE = 5;
export const SCROLL_BUFFER = 25;
export const MESSAGE_LENGTH_THRESHOLD = 50;
export const TYPING_INTERVAL = 35;
export const LIMIT_NUMBER_STANDARD_CONVERSATIONS = 100;
export const PUBLIC_URL = "https://bastian.etendo.cloud";

// Error messages mapped to HTTP status codes
export const ERROR_MESSAGES: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};

// Default error message for network errors
export const NETWORK_RESPONSE_NOT_OK = "Network response was not ok";

/* Images */
export const ETENDO_SQUARE_LOGOTYPE = "/assets/etendo-square-logotype.png";
export const BACKGROUND_LOGIN = "/assets/bg-login.png";
export const ETENDO_FAVICON = "/assets/etendo-favicon.png";
export const STARS = "/assets/icons/stars.png";
export const REMEMBER_ACTIVE = "/assets/icons/remember-active.png";
export const REMEMBER_DISABLED = "/assets/icons/remember-disabled.png";
export const ETENDO_CHAT = "/assets/etendo-chat.svg";
export const SMILE = "/assets/icons/smile.png";
export const SMILE_GREEN = "/assets/icons/smile-green.png";
export const SAD = "/assets/icons/sad.png";
export const SAD_RED = "/assets/icons/sad-red.png";
export const COPY_WHITE = "/assets/icons/copy-white.png";
export const ETENDO_BOT = "/assets/etendo-bot.png";
export const REFORMULATE = "/assets/icons/reformulate.png";
export const REFORMULATE_PURPLE = "/assets/icons/reformulate-purple.png";
export const COPY_PURPLE = "/assets/icons/copy-purple.png";
export const COPY = "/assets/icons/copy.png";
export const SEARCH = "/assets/icons/search.png";
export const WITHOUT_RESULTS = "/assets/without-results.png";
export const SEND_ARROW = "/assets/icons/send-arrow.png";
export const CLIP = "/assets/icons/clip.png";
export const BACKGROUND_POPUP = "/assets/bg-popup.png";
export const BACKGROUND_POPUP_DARK = "/assets/bg-popup-dark.png";
export const NEW_CHAT = "/assets/icons/new-chat.png";
export const NEW_CHAT_DARK = "/assets/icons/new-chat-dark.png";
export const BLUE_TRASH = "/assets/icons/blue-trash.svg";
export const TRASH_DARK = "/assets/icons/trash-dark.svg";
export const ARROW_BOTTOM = "/assets/icons/arrow-bottom.png";
export const ARROW_BOTTOM_DARK = "/assets/icons/arrow-bottom-dark.png";
export const ETENDO_LOGOTYPE = "/assets/etendo-logotype.png";
export const ETENDO_WHITE_LOGOTYPE = "/assets/etendo-white-logotype.png";
export const LIGHT_THEME = "/assets/icons/light-theme.png";
export const DARK_THEME = "/assets/icons/dark-theme.png";
export const DOTS = "/assets/icons/dots.png";
export const DEFAULT_USER = "/assets/icons/default-user.svg";
export const ALERT = "/assets/icons/alert.png";
export const ROBOT = "/assets/icons/robot.png";
export const LIKE = "/assets/icons/like.png";
export const GREEN_CHECK = "/assets/icons/green-check.png";
export const BLUE_CHECK = "/assets/icons/blue-check.svg";
export const WHITE_CHECK = "/assets/icons/white-check.svg";
export const BLUE_CLOSE = "/assets/icons/blue-close.svg";
export const WHITE_CLOSE = "/assets/icons/white-close.svg";
export const SHOW_PASSWORD = "/assets/icons/show-password.png";
export const HIDE_PASSWORD = "/assets/icons/hide-password.png";
export const FAVORITE = "/assets/icons/favorite.png";
export const FAVORITE_ACTIVE = "/assets/icons/favorite-active.png";
export const EDIT = "/assets/icons/edit.png";
export const FAVORITE_DARK = "/assets/icons/favorite-dark.png";
export const EDIT_DARK = "/assets/icons/edit-dark.png";
export const SETTINGS = "/assets/icons/settings.svg";
export const SETTINGS_DARK = "/assets/icons/settings-dark.svg";
export const SHARE = "/assets/icons/share.svg";
export const SHARE_DARK = "/assets/icons/share-dark.svg";
export const SHARE_CONVERSATION = "/assets/share.svg";
export const LINK_CONVERSATION = "/assets/icons/link-conversation.svg";
export const LINK_CONVERSATION_DARK =
  "/assets/icons/link-conversation-dark.svg";
export const SUBSCRIPTION_TO_VERSION_PREMIUM =
  "/assets/icons/subscription-to-version-premium.svg";
export const SUBSCRIPTION_TO_VERSION_PREMIUM_DARK =
  "/assets/icons/subscription-to-version-premium-dark.svg";
