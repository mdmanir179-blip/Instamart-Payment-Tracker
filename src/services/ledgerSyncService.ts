import { 
  doc, 
  collection, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { InvoiceRecord, PaymentRecord } from '../types';

export interface LedgerMetadata {
  id: string;
  lastUploadedAt: string;
  lastUploadFileName?: string;
  lastUploadType?: string;
  vendorName?: string;
  totalInvoices?: number;
  totalPayments?: number;
  updatedAt: string;
}

export interface SyncDataPayload {
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  metadata: LedgerMetadata | null;
}

const LEDGER_ID = 'main';
const CHUNK_SIZE = 100;

/**
 * Split an array into slices of given size
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Save new or updated dataset to Firestore so all users see the exact same data
 */
export async function saveLedgerToFirestore(params: {
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  fileName?: string;
  fileType?: string;
  vendorName?: string;
}): Promise<LedgerMetadata> {
  const ledgerPath = `ledgers/${LEDGER_ID}`;
  const now = new Date().toISOString();

  const metadata: LedgerMetadata = {
    id: LEDGER_ID,
    lastUploadedAt: now,
    lastUploadFileName: params.fileName || 'Uploaded_Sheet.xlsx',
    lastUploadType: params.fileType || 'dataset',
    vendorName: params.vendorName || params.invoices[0]?.vendorName || params.payments[0]?.vendorName || 'Instamart Vendor',
    totalInvoices: params.invoices.length,
    totalPayments: params.payments.length,
    updatedAt: now,
  };

  try {
    // 1. Fetch current existing chunk IDs to clean up any surplus chunks later
    const chunksCollRef = collection(db, 'ledgers', LEDGER_ID, 'chunks');
    const existingChunksSnap = await getDocs(chunksCollRef);
    const existingChunkIds = new Set(existingChunksSnap.docs.map(d => d.id));

    // 2. Prepare chunk documents
    const invoiceChunks = chunkArray(params.invoices, CHUNK_SIZE);
    const paymentChunks = chunkArray(params.payments, CHUNK_SIZE);

    const activeChunkIds = new Set<string>();
    const batch = writeBatch(db);

    // Save metadata document
    const ledgerDocRef = doc(db, 'ledgers', LEDGER_ID);
    batch.set(ledgerDocRef, metadata);

    // Save Invoice chunks
    invoiceChunks.forEach((chunk, index) => {
      const chunkId = `inv_chunk_${index}`;
      activeChunkIds.add(chunkId);
      const chunkRef = doc(db, 'ledgers', LEDGER_ID, 'chunks', chunkId);
      batch.set(chunkRef, {
        id: chunkId,
        chunkIndex: index,
        totalChunks: invoiceChunks.length,
        dataType: 'invoices',
        itemsJson: JSON.stringify(chunk),
        count: chunk.length,
        updatedAt: now,
      });
    });

    // Save Payment chunks
    paymentChunks.forEach((chunk, index) => {
      const chunkId = `pmt_chunk_${index}`;
      activeChunkIds.add(chunkId);
      const chunkRef = doc(db, 'ledgers', LEDGER_ID, 'chunks', chunkId);
      batch.set(chunkRef, {
        id: chunkId,
        chunkIndex: index,
        totalChunks: paymentChunks.length,
        dataType: 'payments',
        itemsJson: JSON.stringify(chunk),
        count: chunk.length,
        updatedAt: now,
      });
    });

    // Delete any old chunks that are no longer part of this dataset
    existingChunkIds.forEach(oldId => {
      if (!activeChunkIds.has(oldId)) {
        const oldChunkRef = doc(db, 'ledgers', LEDGER_ID, 'chunks', oldId);
        batch.delete(oldChunkRef);
      }
    });

    // Commit all writes atomically
    await batch.commit();
    return metadata;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ledgerPath);
  }
}

/**
 * Remove all ledger data from Firestore
 */
export async function clearLedgerFromFirestore(): Promise<void> {
  const ledgerPath = `ledgers/${LEDGER_ID}`;
  try {
    const chunksCollRef = collection(db, 'ledgers', LEDGER_ID, 'chunks');
    const existingChunksSnap = await getDocs(chunksCollRef);

    const batch = writeBatch(db);
    existingChunksSnap.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    const ledgerDocRef = doc(db, 'ledgers', LEDGER_ID);
    batch.delete(ledgerDocRef);

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ledgerPath);
  }
}

/**
 * Listen for real-time changes to the shared ledger
 * When any user uploads a sheet, all other users instantly receive the updated data
 */
export function subscribeToSharedLedger(
  onData: (payload: SyncDataPayload) => void,
  onError?: (err: Error) => void
): () => void {
  const ledgerDocRef = doc(db, 'ledgers', LEDGER_ID);
  const ledgerPath = `ledgers/${LEDGER_ID}`;

  let chunksUnsubscribe: (() => void) | null = null;

  const unsubscribeDoc = onSnapshot(
    ledgerDocRef,
    async (docSnap) => {
      if (!docSnap.exists()) {
        // No ledger in Firestore
        onData({ invoices: [], payments: [], metadata: null });
        return;
      }

      const meta = docSnap.data() as LedgerMetadata;

      // Subscribe to chunks
      if (chunksUnsubscribe) {
        chunksUnsubscribe();
      }

      const chunksCollRef = collection(db, 'ledgers', LEDGER_ID, 'chunks');
      chunksUnsubscribe = onSnapshot(
        chunksCollRef,
        (chunksSnap) => {
          const invoicesMap: Map<number, InvoiceRecord[]> = new Map();
          const paymentsMap: Map<number, PaymentRecord[]> = new Map();

          chunksSnap.forEach((cDoc) => {
            const data = cDoc.data();
            try {
              if (data.dataType === 'invoices' && data.itemsJson) {
                const items = JSON.parse(data.itemsJson) as InvoiceRecord[];
                invoicesMap.set(data.chunkIndex || 0, items);
              } else if (data.dataType === 'payments' && data.itemsJson) {
                const items = JSON.parse(data.itemsJson) as PaymentRecord[];
                paymentsMap.set(data.chunkIndex || 0, items);
              }
            } catch (parseErr) {
              console.warn('Failed to parse chunk JSON:', cDoc.id, parseErr);
            }
          });

          // Reassemble sorted by chunkIndex
          const sortedInvoices: InvoiceRecord[] = [];
          Array.from(invoicesMap.keys())
            .sort((a, b) => a - b)
            .forEach(idx => {
              sortedInvoices.push(...(invoicesMap.get(idx) || []));
            });

          const sortedPayments: PaymentRecord[] = [];
          Array.from(paymentsMap.keys())
            .sort((a, b) => a - b)
            .forEach(idx => {
              sortedPayments.push(...(paymentsMap.get(idx) || []));
            });

          onData({
            invoices: sortedInvoices,
            payments: sortedPayments,
            metadata: meta,
          });
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, `${ledgerPath}/chunks`);
        }
      );
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, ledgerPath);
    }
  );

  return () => {
    unsubscribeDoc();
    if (chunksUnsubscribe) {
      chunksUnsubscribe();
    }
  };
}
