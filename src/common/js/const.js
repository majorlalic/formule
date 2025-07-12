export const ACCESS_TOKEN_KEY = "token";

export const MEMORY = "param-memory-";

/**
 * SSO注册的服务
 * @enum
 * @readonly
 */
export const SERVERS = {
    SSO: "ssoHost",
    DATACENTER: "dataCenterApi",
    SECURITY: "wscwebapi",
    RealPlayer: "realplayerApi",
};

/**
 * 消息类型
 * @enum
 * @readonly
 */
export const MessageType = {
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    SUCCESS: "success",
};

/**
 * 信息页类型
 * @enum
 * @readonly
 */
export const PageType = {
    ADD: "add",
    EDIT: "edit",
    INFO: "info",
};

/**
 * 系统分类
 * @enum
 * @readonly
 */
export const AlarmSystem = {
    BOUNDARY: "0",
    FIRE: "1",
    LEAKAGE: "2",
    ACCESS: "3",
    AI: "4",
};

/**
 * 时间范围
 * @enum
 * @readonly
 */
export const DateRange = {
    YEAR: 0,
    MONTH: 1,
    WEEK: 2,
    DAY: 3,
};

/**
 * 字典表
 * @enum
 * @readonly
 */
export const Dir = {
    SYSTEM: "system",
    ALARM_STATUS: "alarmStatus",
    SEX: "sexType",
    ORG_TYPE: "orgType",
    ACCESS_TYPE: "accessType",
    VISITOR_TYPE: "visitorType",
};

/**
 * 系统分类
 * @enum
 * @readonly
 */
export const SystemName = {
    出入系统: "access",
    周界系统: "boundary",
    泄漏系统: "leakage",
    消防系统: "fire",
    视频系统: "ai",
};

/**
 * 警情状态
 * @enum
 * @readonly
 */
export const Status = {
    0: "警情上报",
    1: "警情确认",
    2: "警情处置",
    3: "警情结案",
};