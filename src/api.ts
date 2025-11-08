import { onTTFB, onCLS, onFCP, onINP, onLCP } from "web-vitals";
import { uuidv7 } from "uuidv7";
import { Configuration, Tracker, Metric, NavigatorData } from "./type";

// Convert version string to number before saving it to database.
// The aim is to make it easier to sort and filter versions.
// 1.8.17 will be converted to 1008017, 1_000_000 x major + 1_000 x minor + 1 x patch
const VERSION = "0.0.1";
const VERSION_NUMBER = 1;

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

export function init(cfg: Configuration) {
    let id = uuidv7();
    config = cfg;

    // Initiate the tracker and collect navigator data
    InitiateTracker(id);
    let navigatordata = CollectNavigatorData(id);

    // Send the navigator data
    sendNavigatorData(navigatordata);

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
        analytics: {
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
    };
}

function CollectNavigatorData(id: string): NavigatorData {
    let navigator: ExtendedNavigator = window.navigator as ExtendedNavigator;
    let navigatordata: NavigatorData = {
        id: id,
        appCodeName: navigator.appCodeName,
        oscpu: navigator.oscpu,
        platform: navigator.platform,
        userAgent: navigator.userAgent, // browser's UA string
        connDownlink: navigator.connection?.downlink || 0, // megabits per second
        connDownlinkMax: navigator.connection?.downlinkMax || 0, // megabits per second
        connEffectiveType: navigator.connection?.effectiveType || "", // 'slow-2g', '2g', '3g', or '4g'
        connRtt: navigator.connection?.rtt || 0, // milliseconds, estimated effective round-trip time of the current connection (rounded to multiple of 25ms)
        connSaveData: navigator.connection?.saveData || false, // if user set a reduced data usage option on the user agent
        connType: navigator.connection?.type || "", // bluetooth, cellular, ethernet, none, wifi, wimax, other, unknown
    };
    return navigatordata;
}

function sendAnalyticsData(metric: Metric) {
    switch (metric.name) {
        case "TTFB":
            tracker.analytics.TTFB = metric.value;
            tracker.analytics.TTFB_ID = metric.id;
        case "LCP":
            tracker.analytics.LCP = metric.value;
            tracker.analytics.LCP_ID = metric.id;
        case "FCP":
            tracker.analytics.FCP = metric.value;
            tracker.analytics.FCP_ID = metric.id;
        case "CLS":
            tracker.analytics.CLS = metric.value;
            tracker.analytics.CLS_ID = metric.id;
        case "INP":
            tracker.analytics.INP = metric.value;
            tracker.analytics.INP_ID = metric.id;
    }
    console.log(tracker);
    const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
    });

    navigator.sendBeacon(`${config.trackerURL}/analytics`, body);
}

function sendNavigatorData(navigatordata: NavigatorData) {
    const body = JSON.stringify({
        ...navigatordata,
        version: VERSION_NUMBER,
    });

    navigator.sendBeacon(`${config.trackerURL}/navigators`, body);
}
