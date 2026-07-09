/**
 * Decoder - parses Clarity values into typed events
 *
 * Pluggable so builders can add custom decoders for their contracts.
 */

const decoders = new Map();

function registerDecoder(eventType, decoderFn) {
  decoders.set(eventType, decoderFn);
}

function decodeEvent(event) {
  if (!event || !event.event_type) return null;

  const decoder = decoders.get(event.event_type);
  if (decoder) {
    return decoder(event);
  }

  // Default decoder for common Clarity print events
  if (event.event_type === 'smart_contract_log') {
    return {
      type: 'log',
      data: event.contract_log?.value || {},
    };
  }

  return null;
}

// Built-in decoders for standard Clarity events
registerDecoder('ft_transfer_event', (event) => ({
  type: 'ft_transfer',
  data: {
    sender: event.asset.sender,
    recipient: event.asset.recipient,
    amount: event.asset.amount,
    asset_identifier: event.asset.asset_id,
  },
}));

registerDecoder('nft_transfer_event', (event) => ({
  type: 'nft_transfer',
  data: {
    sender: event.asset.sender,
    recipient: event.asset.recipient,
    asset_identifier: event.asset.asset_id,
    token_id: event.asset.value,
  },
}));

module.exports = { decodeEvent, registerDecoder };
