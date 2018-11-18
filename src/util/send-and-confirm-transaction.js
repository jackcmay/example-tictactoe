// @flow

import {sendAndConfirmTransaction as realSendAndConfirmTransaction} from '@solana/web3.js';
import type {Account, Connection, Transaction} from '@solana/web3.js';
import YAML from 'json-to-pretty-yaml';

type TransactionNotification = (string, string) => void;

let notify: TransactionNotification = () => undefined;

export function onTransaction(callback: TransactionNotification) {
  notify = callback;
}

export async function sendAndConfirmTransaction(
  title: string,
  connection: Connection,
  transaction: Transaction,
  ...signers: Array<Account>
): Promise<void> {
  const when = Date.now();

  const signature = await realSendAndConfirmTransaction(
    connection,
    transaction,
    ...signers,
  );

  const body = {
    time: new Date(when).toString(),
    from: signers[0].publicKey.toBase58(),
    signature,
    instructions: transaction.instructions.map(i => {
      return {
        keys: i.keys.map(key => key.toBase58()),
        programId: i.programId.toBase58(),
        userdata: '0x' + i.userdata.toString('hex'),
      };
    }),
  };

  notify(title, YAML.stringify(body).replace(/"/g, ''));
}