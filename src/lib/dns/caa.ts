export function formatCaaData(data: string): string {
	const trimmed = data.trim();
	if (!trimmed.startsWith('\\#')) return data;

	const rest = trimmed.slice(2).trim();
	const firstSpace = rest.search(/\s/);
	if (firstSpace === -1) return data;

	const hex = rest.slice(firstSpace).replace(/\s+/g, '');
	if (hex.length < 4 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return data;

	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}

	const flags = bytes[0];
	const tagLength = bytes[1];
	if (tagLength === 0 || 2 + tagLength > bytes.length) return data;

	const decoder = new TextDecoder();
	const tag = decoder.decode(bytes.subarray(2, 2 + tagLength));
	if (!/^[a-z0-9]+$/i.test(tag)) return data;

	const value = decoder.decode(bytes.subarray(2 + tagLength));

	return `${flags} ${tag} "${value}"`;
}
