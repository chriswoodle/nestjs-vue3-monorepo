import * as path from 'path';
import debug from 'debug';
import './utils/environment'
import { LoggerService, Optional, LogLevel } from '@nestjs/common';
import { isPlainObject } from './utils/shared';

export function createBasicLogger(packageName: string, _path: string, scope?: string) {
    return debug(`${packageName}:${path.basename(_path)}${scope ? ':' + scope : ''}`)
}

export function buildLogContext(packageName: string, _path: string, scope?: string) {
    return `${packageName}:${path.basename(_path)}${scope ? ':' + scope : ''}`;
}

const colors = [
    20, 21, 26, 27, 32, 33, 38, 39, 40, 41, 42, 43, 44, 45, 56, 57, 62, 63, 68, 69, 74, 75, 76, 77, 78,
    79, 80, 81, 92, 93, 98, 99, 112, 113, 128, 129, 134, 135, 148, 149, 160, 161, 162, 163, 164, 165,
    166, 167, 168, 169, 170, 171, 172, 173, 178, 179, 184, 185, 196, 197, 198, 199, 200, 201, 202, 203,
    204, 205, 206, 207, 208, 209, 214, 215, 220, 221
];

type ColorTextFn = (text: string) => string;

const isColorAllowed = () => !process.env.NO_COLOR;
const colorIfAllowed = (colorFn: ColorTextFn) => (text: string) =>
    isColorAllowed() ? colorFn(text) : text;

export const clc = {
    bold: colorIfAllowed((text: string) => `\x1B[1m${text}\x1B[0m`),
    green: colorIfAllowed((text: string) => `\x1B[32m${text}\x1B[39m`),
    yellow: colorIfAllowed((text: string) => `\x1B[33m${text}\x1B[39m`),
    red: colorIfAllowed((text: string) => `\x1B[31m${text}\x1B[39m`),
    magentaBright: colorIfAllowed((text: string) => `\x1B[95m${text}\x1B[39m`),
    cyanBright: colorIfAllowed((text: string) => `\x1B[96m${text}\x1B[39m`),
};
export interface ColorLoggerOptions {
    /**
     * Enabled log levels.
     */
    logLevels?: LogLevel[];
    /**
     * If enabled, will print timestamp (time difference) between current and previous log message.
     */
    disableTimestamp?: boolean;
}

const DEFAULT_LOG_LEVELS: LogLevel[] = [
    'log',
    'error',
    'warn',
    'debug',
    'verbose',
    'fatal',
];

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
});

const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
    verbose: 0,
    debug: 1,
    log: 2,
    warn: 3,
    error: 4,
    fatal: 5,
};

/**
 * Checks if target level is enabled.
 * @param targetLevel target level
 * @param logLevels array of enabled log levels
 */
export function isLogLevelEnabled(
    targetLevel: LogLevel,
    logLevels: LogLevel[] | undefined,
): boolean {
    if (!logLevels || (Array.isArray(logLevels) && logLevels?.length === 0)) {
        return false;
    }
    if (logLevels.includes(targetLevel)) {
        return true;
    }
    const highestLogLevelValue = logLevels
        .map(level => LOG_LEVEL_VALUES[level])
        .sort((a, b) => b - a)?.[0];

    const targetLevelValue = LOG_LEVEL_VALUES[targetLevel];
    return targetLevelValue >= highestLogLevelValue;
}

export class ColorLogger implements LoggerService {
    private static lastTimestampAt?: number;
    private originalContext?: string;

    constructor();
    constructor(context: string);
    constructor(context: string, options: ColorLoggerOptions);
    constructor(
        @Optional()
        protected context?: string,
        @Optional()
        protected options: ColorLoggerOptions = {},
    ) {
        if (!options.logLevels) {
            options.logLevels = DEFAULT_LOG_LEVELS;
        }
        if (context) {
            this.originalContext = context;
        }


    }

    /**
     * Write a 'log' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    log(message: any, context?: string): void;
    log(message: any, ...optionalParams: [...any, string?]): void;
    log(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('log')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'log');
    }

    /**
     * Write an 'error' level log, if the configured level allows for it.
     * Prints to `stderr` with newline.
     */
    error(message: any, stackOrContext?: string): void;
    error(message: any, stack?: string, context?: string): void;
    error(message: any, ...optionalParams: [...any, string?, string?]): void;
    error(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('error')) {
            return;
        }
        const { messages, context, stack } =
            this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);

        this.printMessages(messages, context, 'error', 'stderr');
        this.printStackTrace(stack);
    }

    /**
     * Write a 'warn' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    warn(message: any, context?: string): void;
    warn(message: any, ...optionalParams: [...any, string?]): void;
    warn(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('warn')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'warn');
    }

    /**
     * Write a 'debug' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    debug(message: any, context?: string): void;
    debug(message: any, ...optionalParams: [...any, string?]): void;
    debug(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('debug')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'debug');
    }

    /**
     * Write a 'verbose' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    verbose(message: any, context?: string): void;
    verbose(message: any, ...optionalParams: [...any, string?]): void;
    verbose(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('verbose')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'verbose');
    }

    /**
     * Write a 'fatal' level log, if the configured level allows for it.
     * Prints to `stdout` with newline.
     */
    fatal(message: any, context?: string): void;
    fatal(message: any, ...optionalParams: [...any, string?]): void;
    fatal(message: any, ...optionalParams: any[]) {
        if (!this.isLevelEnabled('fatal')) {
            return;
        }
        const { messages, context } = this.getContextAndMessagesToPrint([
            message,
            ...optionalParams,
        ]);
        this.printMessages(messages, context, 'fatal');
    }

    /**
     * Set log levels
     * @param levels log levels
     */
    setLogLevels(levels: LogLevel[]) {
        if (!this.options) {
            this.options = {};
        }
        this.options.logLevels = levels;
    }

    /**
     * Set logger context
     * @param context context
     */
    setContext(context: string) {
        this.context = context;
    }

    /**
     * Resets the logger context to the value that was passed in the constructor.
     */
    resetContext() {
        this.context = this.originalContext;
    }

    isLevelEnabled(level: LogLevel): boolean {
        const logLevels = this.options?.logLevels;
        return isLogLevelEnabled(level, logLevels);
    }

    protected getTimestamp(): string {
        return dateTimeFormatter.format(Date.now());
    }

    protected printMessages(
        messages: unknown[],
        context = '',
        logLevel: LogLevel = 'log',
        writeStreamType?: 'stdout' | 'stderr',
    ) {
        messages.forEach(message => {
            const pidMessage = this.formatPid(process.pid);
            const contextMessage = this.formatContext(context);
            const timestampDiff = this.updateAndGetTimestampDiff(context);
            const formattedLogLevel = logLevel.toUpperCase().padStart(7, ' ');
            const formattedMessage = this.formatMessage(
                logLevel,
                message,
                pidMessage,
                formattedLogLevel,
                contextMessage,
                timestampDiff,
            );

            process[writeStreamType ?? 'stdout'].write(formattedMessage);
        });
    }

    protected formatPid(pid: number) {
        return `[Nest] ${pid}  - `;
    }

    protected formatContext(context: string): string {
        return context ? this.colorText(context, `[${context}] `) : '';
    }

    protected formatMessage(
        logLevel: LogLevel,
        message: unknown,
        pidMessage: string,
        formattedLogLevel: string,
        contextMessage: string,
        timestampDiff: string,
    ) {
        const output = this.stringifyMessage(message, logLevel);
        pidMessage = this.colorize(pidMessage, logLevel);
        formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
        return `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}${timestampDiff}\n`;
    }

    protected stringifyMessage(message: unknown, logLevel: LogLevel): string {
        // If the message is a function, call it and re-resolve its value.
        return typeof message === 'function'
            ? this.stringifyMessage(message(), logLevel)
            : isPlainObject(message) || Array.isArray(message)
                ? `${'Object:'}\n${JSON.stringify(
                    message,
                    (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value,
                    2,
                )}\n`
                : message as string;
    }

    protected colorize(message: string, logLevel: LogLevel) {
        const color = this.getColorByLogLevel(logLevel);
        return color(message);
    }

    protected printStackTrace(stack?: string) {
        if (!stack) {
            return;
        }
        process.stderr.write(`${stack}\n`);
    }

    protected updateAndGetTimestampDiff(context: string): string {
        const lastTimestampAt = ColorLogger.lastTimestampAt;
        const includeTimestamp = lastTimestampAt && !this.options?.disableTimestamp;
        const result = includeTimestamp
            ? this.formatTimestampDiff(context, Date.now() - lastTimestampAt!)
            : '';
        ColorLogger.lastTimestampAt = Date.now();
        return result;
    }

    protected formatTimestampDiff(context: string, timestampDiff: number) {
        return this.colorText(context, ` +${timestampDiff}ms`);
    }

    private getContextAndMessagesToPrint(args: unknown[]) {
        if (args?.length <= 1) {
            return { messages: args, context: this.context };
        }
        const lastElement = args[args.length - 1];
        const isContext = typeof lastElement === 'string';
        if (!isContext) {
            return { messages: args, context: this.context };
        }
        return {
            context: lastElement as string,
            messages: args.slice(0, args.length - 1),
        };
    }

    private getContextAndStackAndMessagesToPrint(args: unknown[]) {
        if (args.length === 2) {
            return this.isStackFormat(args[1])
                ? {
                    messages: [args[0]],
                    stack: args[1] as string,
                    context: this.context,
                }
                : {
                    messages: [args[0]],
                    context: args[1] as string,
                };
        }

        const { messages, context } = this.getContextAndMessagesToPrint(args);
        if (messages?.length <= 1) {
            return { messages, context };
        }
        const lastElement = messages[messages.length - 1];
        const isStack = typeof lastElement === 'string';
        // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
        if (!isStack && lastElement !== undefined) {
            return { messages, context };
        }
        return {
            stack: lastElement as string,
            messages: messages.slice(0, messages.length - 1),
            context,
        };
    }

    private isStackFormat(stack: unknown) {
        if (typeof stack !== 'string' || stack == undefined) {
            return false;
        }

        return /^(.)+\n\s+at .+:\d+:\d+$/.test(stack);
    }

    private getColorByLogLevel(level: LogLevel) {
        switch (level) {
            case 'debug':
                return clc.magentaBright;
            case 'warn':
                return clc.yellow;
            case 'error':
                return clc.red;
            case 'verbose':
                return clc.cyanBright;
            case 'fatal':
                return clc.bold;
            default:
                return clc.green;
        }
    }

    colorText(context: string, text: string) {
        if (!isColorAllowed())
            return text;

        const c = this.selectColor(context);
        const colorCode = '\x1B[3' + (c < 8 ? c : '8;5;' + c) + 'm';
        return `${colorCode}${text}\x1B[39m`;
    }

    selectColor(context = '') {
        let hash = 0;

        for (let i = 0; i < context.length; i++) {
            hash = ((hash << 5) - hash) + context.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }

        return colors[Math.abs(hash) % colors.length];
    }
}