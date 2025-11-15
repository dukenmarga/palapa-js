import {
    TTFBMetric,
    LCPMetric,
    FCPMetric,
    CLSMetric,
    INPMetric,
} from "web-vitals";

export type Metric = TTFBMetric | LCPMetric | FCPMetric | CLSMetric | INPMetric;

export type Configuration = {
    // The URL of the web vitals tracker
    trackerURL: string;
    projectID: string;
};

// Core: TTFB, LCP, FCP, CLS, INP
type Core = {
    TTFB: number;
    TTFB_ID: string;
    LCP: number;
    LCP_ID: string;
    FCP: number;
    FCP_ID: string;
    CLS: number;
    CLS_ID: string;
    INP: number;
    INP_ID: string;
};

// Navigator: OS, platform, user agent, connection
type Browser = {
    app_code_name: string;
    oscpu: string;
    platform: string;

    // browser's UA string
    user_agent: string;
};

type Connection = {
    // megabits per second
    downlink: number;

    // megabits per second
    downlink_max: number;

    // 'slow-2g', '2g', '3g', or '4g'
    effective_type: string;

    // milliseconds, estimated effective round-trip time of the current connection (rounded to multiple of 25ms)
    rtt: number;

    // if user set a reduced data usage option on the user agent
    save_data: boolean;

    // bluetooth, cellular, ethernet, none, wifi, wimax, other, unknown
    type: string;
};

export type Tracker = {
    // uuid v7, should be the same with navigator id
    id: string;

    // Project ID
    project_id: string;

    // Version of the tracker client
    version: number;

    // created at
    created_at: number;

    // Core data
    core: Core;

    // Browser data
    browser: Browser;

    // Connection data
    connection: Connection;
};

// It is separated from core data, since it will be sent only once to the API
export type NavigatorTracker = {
    // Browser data
    browser: Browser;

    // Connection data
    connection: Connection;
};
