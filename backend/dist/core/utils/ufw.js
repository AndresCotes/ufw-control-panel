"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidIpOrAny = isValidIpOrAny;
exports.isValidPort = isValidPort;
exports.normalizeProto = normalizeProto;
exports.normalizeAction = normalizeAction;
exports.parseUfwNumbered = parseUfwNumbered;
exports.buildUfwRuleArgs = buildUfwRuleArgs;
const ACTIONS = ['allow', 'deny', 'reject', 'limit'];
const PROTOCOLS = ['tcp', 'udp', 'any'];
function isValidIpOrAny(value) {
    if (value === 'any')
        return true;
    const cidr = value.split('/');
    const ip = cidr[0];
    const octets = ip.split('.');
    if (octets.length !== 4)
        return false;
    const validOctets = octets.every((x) => /^\d+$/.test(x) && Number(x) >= 0 && Number(x) <= 255);
    if (!validOctets)
        return false;
    if (cidr[1] === undefined)
        return true;
    return /^\d+$/.test(cidr[1]) && Number(cidr[1]) >= 0 && Number(cidr[1]) <= 32;
}
function isValidPort(value) {
    if (!/^\d+$/.test(value))
        return false;
    const n = Number(value);
    return n >= 1 && n <= 65535;
}
function normalizeProto(input) {
    if (!input || input === 'any')
        return 'any';
    if (input === 'tcp' || input === 'udp')
        return input;
    throw new Error('Invalid protocol');
}
function normalizeAction(input) {
    const lowered = input.toLowerCase();
    if (ACTIONS.includes(lowered))
        return lowered;
    throw new Error('Invalid action');
}
function parseUfwNumbered(output) {
    const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = [];
    for (const line of lines) {
        if (!line.startsWith('['))
            continue;
        const match = line.match(/^\[\s*(\d+)\]\s+(.+?)\s+(ALLOW IN|DENY IN|REJECT IN|LIMIT IN|ALLOW OUT|DENY OUT|REJECT OUT|LIMIT OUT)\s+(.+)$/i);
        if (!match)
            continue;
        parsed.push({
            ufwNumber: Number(match[1]),
            to: match[2].trim(),
            action: match[3].trim(),
            from: match[4].trim(),
            raw: line
        });
    }
    return parsed;
}
function buildUfwRuleArgs(input) {
    const action = normalizeAction(input.action);
    const protocol = normalizeProto(input.protocol);
    const direction = input.direction && input.direction !== 'any' ? input.direction : undefined;
    const interfaceName = input.interfaceName?.trim();
    const sourceIp = input.sourceIp?.trim() || 'any';
    const destinationIp = input.destinationIp?.trim() || 'any';
    if (!isValidIpOrAny(sourceIp))
        throw new Error('Invalid source IP/CIDR');
    if (!isValidIpOrAny(destinationIp))
        throw new Error('Invalid destination IP/CIDR');
    if (!isValidPort(input.port))
        throw new Error('Invalid port');
    const args = [action];
    if (direction) {
        args.push(direction);
    }
    if (interfaceName) {
        if (!/^[a-zA-Z0-9_.:-]{1,32}$/.test(interfaceName)) {
            throw new Error('Invalid interface name');
        }
        args.push('on', interfaceName);
    }
    if (sourceIp !== 'any') {
        args.push('from', sourceIp);
    }
    args.push('to', destinationIp, 'port', input.port);
    if (protocol !== 'any') {
        args.push('proto', protocol);
    }
    return {
        args,
        commandPreview: `ufw ${args.join(' ')}`
    };
}
