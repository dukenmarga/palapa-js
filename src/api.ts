import { onTTFB, onCLS, onFCP, onINP, onLCP } from "web-vitals";
import { uuidv7 } from "uuidv7";
import { Configuration, Tracker, Metric, NavigatorTracker } from "./type.js";

// Convert version string to number before saving it to database.
// The aim is to make it easier to sort and filter versions.
// 1.8.17 will be converted to 1008017, 1_000_000 x major + 1_000 x minor + 1 x patch
const VERSION = "0.1.1";
const VERSION_NUMBER = 1_001;

interface ExtendedNavigator extends globalThis.Navigator {
    oscpu: string;
    connection: {
        downlink: number;
        downlinkMax: number;
        effectiveType: string;
        rtt: number;
        saveData: boolean;
        type: string;
    };
}
let tracker: Tracker;
let config: Configuration;
let navigatordata: NavigatorTracker;

export function init(cfg: Configuration) {
    let id = uuidv7();
    config = cfg;

    // Initiate the tracker and collect navigator data
    InitiateTracker(id);
    navigatordata = CollectNavigatorData(id);

    // Measure and log TTFB as soon as it's available.
    onTTFB(sendAnalyticsData);

    // Measure and log LCP as soon as it's available.
    onLCP(sendAnalyticsData);

    // Measure and log FCP as soon as it's available.
    onFCP(sendAnalyticsData);

    // Measure and log CLS as soon as it's available.
    onCLS(sendAnalyticsData);

    // Measure and log INP as soon as it's available.
    onINP(sendAnalyticsData);
}

function InitiateTracker(id: string) {
    tracker = {
        id: id,
        project_id: config.projectID,
        version: VERSION_NUMBER,
        created_at: Date.now(),
        core: {
            TTFB: 0,
            TTFB_ID: "",
            LCP: 0,
            LCP_ID: "",
            FCP: 0,
            FCP_ID: "",
            CLS: 0,
            CLS_ID: "",
            INP: 0,
            INP_ID: "",
        },
        browser: {
            app_code_name: "",
            oscpu: "",
            platform: "",
            user_agent: "",
        },
        connection: {
            downlink: 0,
            downlink_max: 0,
            effective_type: "",
            rtt: 0,
            save_data: false,
            type: "",
        },
    };
}

function CollectNavigatorData(id: string): NavigatorTracker {
    let navigator: ExtendedNavigator = window.navigator as ExtendedNavigator;
    let navigatordata: NavigatorTracker = {
        browser: {
            app_code_name: navigator.appCodeName,
            oscpu: navigator.oscpu,
            platform: navigator.platform,
            user_agent: navigator.userAgent,
        },
        connection: {
            downlink: navigator.connection?.downlink || 0,
            downlink_max: navigator.connection?.downlinkMax || 0,
            effective_type: navigator.connection?.effectiveType || "",
            rtt: navigator.connection?.rtt || 0,
            save_data: navigator.connection?.saveData || false,
            type: navigator.connection?.type || "",
        },
    };
    return navigatordata;
}

function sendAnalyticsData(metric: Metric) {
    switch (metric.name) {
        case "TTFB":
            tracker.core.TTFB = metric.value;
            tracker.core.TTFB_ID = metric.id;
            return;
        case "LCP":
            tracker.core.LCP = metric.value;
            tracker.core.LCP_ID = metric.id;
            break;
        case "FCP":
            tracker.core.FCP = metric.value;
            tracker.core.FCP_ID = metric.id;
            break;
        case "CLS":
            tracker.core.CLS = metric.value;
            tracker.core.CLS_ID = metric.id;
            break;
        case "INP":
            tracker.core.INP = metric.value;
            tracker.core.INP_ID = metric.id;
            break;
    }
    let payload: Tracker = {
        ...tracker,
        version: VERSION_NUMBER,
        browser: navigatordata.browser,
        connection: navigatordata.connection,
    };
    const body = JSON.stringify(payload);

    navigator.sendBeacon(`${config.trackerURL}/analytics`, body);
}
