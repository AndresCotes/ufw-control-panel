const ACTIONS = ['allow', 'deny', 'reject', 'limit'] as const;
const PROTOCOLS = ['tcp', 'udp', 'any'] as const;

export type RuleAction = (typeof ACTIONS)[number];
export type RuleProtocol = (typeof PROTOCOLS)[number];

export interface ParsedUfwRule {
  ufwNumber: number;
  action: string;
  from: string;
  to: string;
  raw: string;
}

export function isValidIpOrAny(value: string): boolean {
  if (value === 'any') return true;
  const cidr = value.split('/');
  const ip = cidr[0];
  const octets = ip.split('.');
  if (octets.length !== 4) return false;
  const validOctets = octets.every((x) => /^\d+$/.test(x) && Number(x) >= 0 && Number(x) <= 255);
  if (!validOctets) return false;
  if (cidr[1] === undefined) return true;
  return /^\d+$/.test(cidr[1]) && Number(cidr[1]) >= 0 && Number(cidr[1]) <= 32;
}

export function isValidPort(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return n >= 1 && n <= 65535;
}

export function normalizeProto(input?: string): RuleProtocol {
  if (!input || input === 'any') return 'any';
  if (input === 'tcp' || input === 'udp') return input;
  throw new Error('Invalid protocol');
}

export function normalizeAction(input: string): RuleAction {
  const lowered = input.toLowerCase();
  if (ACTIONS.includes(lowered as RuleAction)) return lowered as RuleAction;
  throw new Error('Invalid action');
}

export function parseUfwNumbered(output: string): ParsedUfwRule[] {
  const lines = output.split('\n').map((l) => l.trim()).filter(Boolean);
  const parsed: ParsedUfwRule[] = [];

  for (const line of lines) {
    if (!line.startsWith('[')) continue;
    const match = line.match(/^\[\s*(\d+)\]\s+(.+?)\s+(ALLOW IN|DENY IN|REJECT IN|LIMIT IN|ALLOW OUT|DENY OUT|REJECT OUT|LIMIT OUT)\s+(.+)$/i);
    if (!match) continue;
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

export function buildUfwRuleArgs(input: {
  action: string;
  direction?: 'in' | 'out' | 'any';
  interfaceName?: string;
  sourceIp?: string;
  destinationIp?: string;
  port: string;
  protocol?: string;
}): { args: string[]; commandPreview: string } {
  const action = normalizeAction(input.action);
  const protocol = normalizeProto(input.protocol);
  const direction = input.direction && input.direction !== 'any' ? input.direction : undefined;
  const interfaceName = input.interfaceName?.trim();
  const sourceIp = input.sourceIp?.trim() || 'any';
  const destinationIp = input.destinationIp?.trim() || 'any';

  if (!isValidIpOrAny(sourceIp)) throw new Error('Invalid source IP/CIDR');
  if (!isValidIpOrAny(destinationIp)) throw new Error('Invalid destination IP/CIDR');
  if (!isValidPort(input.port)) throw new Error('Invalid port');

  const args: string[] = [action];
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
