import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

/**
 * Firebase 앱 초기화 및 Firestore 인스턴스 생성
 * 
 * 시니어 팁:
 * `firebase-applet-config.json`에 정의된 설정값을 바탕으로 Firebase App을 초기화합니다.
 * AI Studio 및 Cloud 환경에서는 멀티 데이터베이스(`firestoreDatabaseId`)를 사용할 수 있으므로
 * `getFirestore(app, firebaseConfig.firestoreDatabaseId)` 형태로 명시적 전달해 주는 것이 안전합니다.
 */
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 'todos' 컬렉션 참조
export const todosCollectionRef = collection(db, 'todos');

// Firestore 연결 상태 테스트 헬퍼
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase 오프라인 상태이거나 네트워크 연결을 확인해주세요.');
    }
  }
}

// 에러 핸들링을 위한 열거형 및 함수
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
