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
};

type Analytics = {
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

export type NavigatorData = {
    id: string;
    appCodeName: string;
    oscpu: string;
    platform: string;
    userAgent: string;
    connDownlink: number;
    connDownlinkMax: number;
    connEffectiveType: string;
    connRtt: number;
    connSaveData: boolean;
    connType: string;
};

export type Tracker = {
    id: string;
    analytics: Analytics;
};
