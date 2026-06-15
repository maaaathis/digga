type StatusInfo = { label: string; description: string };

const STATUS_BY_KEY: Record<string, StatusInfo> = {
	ok: { label: 'ok', description: 'Standard state with no pending operations or restrictions.' },
	active: { label: 'active', description: 'The domain is active in the registry.' },
	inactive: {
		label: 'inactive',
		description: 'No nameservers are set, so the domain does not resolve.',
	},
	clienttransferprohibited: {
		label: 'clientTransferProhibited',
		description:
			'The registrar blocks transfers to another registrar. A common lock that guards against hijacking.',
	},
	clientdeleteprohibited: {
		label: 'clientDeleteProhibited',
		description: 'The registrar blocks deletion of the domain.',
	},
	clientupdateprohibited: {
		label: 'clientUpdateProhibited',
		description: 'The registrar blocks changes to the domain.',
	},
	clientrenewprohibited: {
		label: 'clientRenewProhibited',
		description: 'The registrar blocks renewal of the domain.',
	},
	clienthold: {
		label: 'clientHold',
		description:
			'The registrar told the registry to stop publishing the domain in DNS, so it will not resolve.',
	},
	servertransferprohibited: {
		label: 'serverTransferProhibited',
		description: 'The registry blocks transfers. Often set for valuable or disputed domains.',
	},
	serverdeleteprohibited: {
		label: 'serverDeleteProhibited',
		description: 'The registry blocks deletion of the domain.',
	},
	serverupdateprohibited: {
		label: 'serverUpdateProhibited',
		description: 'The registry blocks changes to the domain.',
	},
	serverrenewprohibited: {
		label: 'serverRenewProhibited',
		description: 'The registry blocks renewal of the domain.',
	},
	serverhold: {
		label: 'serverHold',
		description: 'The registry stopped publishing the domain in DNS, so it will not resolve.',
	},
	pendingcreate: { label: 'pendingCreate', description: 'A create request is being processed.' },
	pendingdelete: {
		label: 'pendingDelete',
		description: 'The domain is scheduled for deletion after the redemption period.',
	},
	pendingrenew: { label: 'pendingRenew', description: 'A renew request is being processed.' },
	pendingrestore: {
		label: 'pendingRestore',
		description: 'A restore request from redemption is being processed.',
	},
	pendingtransfer: {
		label: 'pendingTransfer',
		description: 'A transfer to another registrar is being processed.',
	},
	pendingupdate: { label: 'pendingUpdate', description: 'An update request is being processed.' },
	addperiod: {
		label: 'addPeriod',
		description:
			'Grace window right after registration when the registrar can cancel for a refund.',
	},
	autorenewperiod: {
		label: 'autoRenewPeriod',
		description: 'Grace window after an automatic renewal.',
	},
	renewperiod: { label: 'renewPeriod', description: 'Grace window after a manual renewal.' },
	transferperiod: { label: 'transferPeriod', description: 'Grace window right after a transfer.' },
	redemptionperiod: {
		label: 'redemptionPeriod',
		description:
			'The domain expired and was removed, but the owner can still restore it for a fee.',
	},
};

export type DescribedStatus = { label: string; description?: string };

export function describeStatus(raw: string): DescribedStatus {
	const withoutUrl = raw.replace(/https?:\/\/\S+/g, '');
	const cleaned = withoutUrl.replace(/[()]/g, '').trim();
	const key = cleaned.toLowerCase().replace(/[^a-z0-9]/g, '');
	const info = STATUS_BY_KEY[key];
	return { label: info?.label ?? cleaned, description: info?.description };
}
