/**
 * @file verify-razorpay-adapter.ts
 * @description Focused unit tests for RazorpayAdapter.findRefundByReceipt.
 *
 * Tests all boundary conditions:
 *   1. Matching refund — correct payment_id, receipt, amount, status=processed
 *   2. Wrong payment ID
 *   3. Wrong receipt
 *   4. Wrong amount
 *   4b. Amount as string (SDK may return numeric strings)
 *   5. Non-processed status (pending, failed)
 *   6. No matching refund (empty items)
 *   7. SDK throws — adapter returns null (does not rethrow)
 *   8. No expectedAmount — matches on receipt+paymentId+status only
 */

import { razorpayAdapter } from '../src/adapters/payment/razorpay.adapter.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ? ${label}`);
    passed++;
  } else {
    console.error(`  ? FAIL: ${label}`);
    failed++;
  }
}

function mockFetchMultipleRefund(items: any[]): void {
  (razorpayAdapter as any).client = {
    payments: {
      fetchMultipleRefund: async (_paymentId: string) => ({
        entity: 'collection',
        count: items.length,
        items,
      }),
    },
  };
}

function mockFetchMultipleRefundThrows(error: Error): void {
  (razorpayAdapter as any).client = {
    payments: {
      fetchMultipleRefund: async (_paymentId: string) => {
        throw error;
      },
    },
  };
}

const TX_ID = 'pay_testTxId123';
const RECEIPT = 'ref_WW-20260919-TEST';
const AMOUNT = 50000;

const BASE_REFUND = {
  id: 'rfnd_abc123',
  payment_id: TX_ID,
  amount: AMOUNT,
  currency: 'INR',
  receipt: RECEIPT,
  status: 'processed',
  entity: 'refund',
  created_at: Math.floor(Date.now() / 1000),
};

async function runTests(): Promise<void> {
  console.log('\n========================================');
  console.log(' RazorpayAdapter.findRefundByReceipt — Unit Tests');
  console.log('========================================\n');

  console.log('Test 1: Matching refund (all criteria match)');
  mockFetchMultipleRefund([BASE_REFUND]);
  const result1 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result1 !== null, 'Returns a non-null RefundResult');
  assert(result1?.refundId === BASE_REFUND.id, `refundId equals ${BASE_REFUND.id}`);
  assert(result1?.amount === AMOUNT, `amount equals ${AMOUNT}`);
  assert(result1?.currency === 'INR', 'currency is INR');
  assert(result1?.status === 'processed', 'status is processed');
  assert(!(result1 as any)?.rawResponse, 'rawResponse not exposed in RefundResult');

  console.log('\nTest 2: Wrong payment ID');
  mockFetchMultipleRefund([{ ...BASE_REFUND, payment_id: 'pay_DIFFERENT' }]);
  const result2 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result2 === null, 'Returns null when payment_id does not match transactionId');

  console.log('\nTest 3: Wrong receipt');
  mockFetchMultipleRefund([{ ...BASE_REFUND, receipt: 'ref_DIFFERENT' }]);
  const result3 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result3 === null, 'Returns null when receipt does not match');

  console.log('\nTest 4: Wrong amount');
  mockFetchMultipleRefund([{ ...BASE_REFUND, amount: 99999 }]);
  const result4 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result4 === null, 'Returns null when amount does not match expectedAmount');

  console.log('\nTest 4b: Amount as string');
  mockFetchMultipleRefund([{ ...BASE_REFUND, amount: String(AMOUNT) }]);
  const result4b = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result4b !== null, 'Returns a match when amount is a numeric string equal to expectedAmount');
  assert(result4b?.amount === AMOUNT, 'Parsed string amount equals numeric expectedAmount');

  console.log('\nTest 5: Non-processed status');
  for (const badStatus of ['pending', 'failed']) {
    mockFetchMultipleRefund([{ ...BASE_REFUND, status: badStatus }]);
    const res = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
    assert(res === null, `Returns null when status is '${badStatus}'`);
  }

  console.log('\nTest 6: No matching refund (empty items)');
  mockFetchMultipleRefund([]);
  const result6 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result6 === null, 'Returns null when fetchMultipleRefund returns empty items');

  console.log('\nTest 7: SDK throws — adapter swallows and returns null');
  mockFetchMultipleRefundThrows(new Error('Network error'));
  const result7 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, AMOUNT);
  assert(result7 === null, 'Returns null when SDK call throws (error is logged, not rethrown)');

  console.log('\nTest 8: No expectedAmount — matches on receipt, paymentId, and status only');
  mockFetchMultipleRefund([{ ...BASE_REFUND, amount: 12345 }]);
  const result8 = await razorpayAdapter.findRefundByReceipt(RECEIPT, TX_ID, undefined);
  assert(result8 !== null, 'Returns a match when expectedAmount is undefined');
  assert(result8?.amount === 12345, 'Returns the actual refund amount from the gateway');

  console.log('\n========================================');
  console.log(` Adapter Unit Tests: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unexpected error during adapter unit tests:', err);
  process.exit(1);
});
