import { auth, db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  QueryConstraint,
  setDoc
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  User,
  UserRole,
  Vehicle,
  VehicleInput,
  VehicleUpdate,
  VehicleStatus,
  Maintenance,
  MaintenanceInput,
  MaintenanceUpdate,
  FuelRecord,
  FuelInput,
  FuelUpdate,
  MileageRecord,
  MileageInput,
  MileageUpdate,
  Assignment,
  AssignmentInput,
  AssignmentUpdate,
  TireChange,
  TireChangeInput,
  TireChangeUpdate,
  PartChange,
  PartChangeInput,
  PartChangeUpdate
} from '../../types';
import { Timestamp } from 'firebase/firestore';

// Auth Services
export const createUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase Auth başarılı:', userCredential.user.uid);
    
    // Firestore'dan kullanıcı bilgilerini al
    const userDoc = await getDocument<User>('users', userCredential.user.uid);
    console.log('Firestore kullanıcı dokümanı:', userDoc);
    
    if (!userDoc) {
      console.error('Kullanıcı dokümanı bulunamadı:', userCredential.user.uid);
      throw new Error('Kullanıcı bilgileri bulunamadı');
    }

    return userDoc;
  } catch (error: any) {
    console.error('Login hatası:', error);
    // Firebase hata mesajlarını Türkçeleştir
    const errorMessage = (() => {
      switch (error.code) {
        case 'auth/invalid-email':
          return 'Geçersiz e-posta adresi.';
        case 'auth/user-disabled':
          return 'Bu hesap devre dışı bırakılmış.';
        case 'auth/user-not-found':
          return 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.';
        case 'auth/wrong-password':
          return 'Yanlış şifre.';
        case 'auth/too-many-requests':
          return 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.';
        default:
          return error.message || 'Giriş yapılırken bir hata oluştu.';
      }
    })();
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
  phone,
  role
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}) => {
  try {
    // Firebase Authentication'da kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kullanıcı profilini güncelle
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Firestore'da kullanıcı dokümanı oluştur
    const userData = {
      id: user.uid,
      email: user.email!,
      firstName,
      lastName,
      role,
      phone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);

    return userData;
  } catch (error: any) {
    // Firebase hata mesajlarını Türkçeleştir
    const errorMessage = (() => {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'Bu e-posta adresi zaten kullanımda.';
        case 'auth/invalid-email':
          return 'Geçersiz e-posta adresi.';
        case 'auth/operation-not-allowed':
          return 'E-posta/şifre girişi etkin değil.';
        case 'auth/weak-password':
          return 'Şifre çok zayıf.';
        default:
          return error.message;
      }
    })();
    throw new Error(errorMessage);
  }
};

// Firestore Services
// Generic add document function
export const addDocument = async <T extends { id: string }>(
  collectionName: string,
  data: any
): Promise<string> => {
  const timestamp = serverTimestamp();
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  });
  return docRef.id;
};

// Generic update document function
export const updateDocument = async <T extends { id: string }>(
  collectionName: string,
  id: string,
  data: any
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  const timestamp = serverTimestamp();
  await setDoc(docRef, { ...data, updatedAt: timestamp }, { merge: true });
};

// Generic get document function
export const getDocument = async <T extends { id: string }>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as T;
};

// Generic query documents function
export const queryDocuments = async <T extends { id: string }>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as T);
};

// Generic delete document function
export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Specific collection services
export const VehicleService = {
  add: async (data: VehicleInput) => {
    return await addDocument<Vehicle>('vehicles', data);
  },
  update: async (id: string, data: VehicleUpdate) => {
    return await updateDocument<Vehicle>('vehicles', id, data);
  },
  get: async (id: string) => {
    return await getDocument<Vehicle>('vehicles', id);
  },
  getAll: async () => {
    return await queryDocuments<Vehicle>('vehicles', [orderBy('createdAt', 'desc')]);
  },
  getByStatus: async (status: VehicleStatus) => {
    return await queryDocuments<Vehicle>('vehicles', [
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    ]);
  },
  delete: async (id: string) => {
    return await deleteDocument('vehicles', id);
  }
};

export class MaintenanceService {
  static async add(data: MaintenanceInput): Promise<string> {
    const docRef = await addDoc(collection(db, 'maintenances'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async update(id: string, data: MaintenanceUpdate): Promise<void> {
    const docRef = doc(db, 'maintenances', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async get(id: string): Promise<Maintenance | null> {
    const docRef = doc(db, 'maintenances', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Maintenance : null;
  }

  static async getAll(): Promise<Maintenance[]> {
    const q = query(
      collection(db, 'maintenances'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Maintenance[];
  }

  static async getByVehicle(vehicleId: string): Promise<Maintenance[]> {
    const q = query(
      collection(db, 'maintenances'),
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Maintenance[];
  }

  static async delete(id: string): Promise<void> {
    const docRef = doc(db, 'maintenances', id);
    await deleteDoc(docRef);
  }
}

export const FuelService = {
  add: async (data: FuelInput) => {
    return await addDoc(collection(db, 'fuels'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  update: async (id: string, data: FuelUpdate) => {
    const docRef = doc(db, 'fuels', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  get: async (id: string) => {
    const docRef = doc(db, 'fuels', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as FuelRecord : null;
  },

  getAll: async () => {
    const q = query(
      collection(db, 'fuels'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FuelRecord[];
  },

  getByVehicle: async (vehicleId: string) => {
    const q = query(
      collection(db, 'fuels'),
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FuelRecord[];
  },

  getByVehicleAndDate: async (vehicleId: string, startDate: Date, endDate: Date) => {
    const q = query(
      collection(db, 'fuels'),
      where('vehicleId', '==', vehicleId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as FuelRecord))
      .filter(record => {
        const recordDate = (record.date as Timestamp).toDate();
        return recordDate >= startDate && recordDate <= endDate;
      });
  },

  delete: async (id: string) => {
    const docRef = doc(db, 'fuels', id);
    await deleteDoc(docRef);
  }
};

export const MileageService = {
  add: (data: MileageInput) => 
    addDocument<MileageRecord>('mileage_records', data),
  
  update: (id: string, data: MileageUpdate) => 
    updateDocument<MileageRecord>('mileage_records', id, data),
  
  get: (id: string) => 
    getDocument<MileageRecord>('mileage_records', id),
  
  getAll: () => 
    queryDocuments<MileageRecord>('mileage_records', [orderBy('recordedAt', 'desc')]),
  
  getByVehicle: (vehicleId: string) => 
    queryDocuments<MileageRecord>('mileage_records', [
      where('vehicleId', '==', vehicleId),
      orderBy('recordedAt', 'desc')
    ]),
  
  delete: (id: string) => 
    deleteDocument('mileage_records', id),
};

export class UserService {
  static async get(id: string): Promise<User | null> {
    return getDocument<User>('users', id);
  }

  static async getAll(): Promise<User[]> {
    return queryDocuments<User>('users', []);
  }

  static async getByRole(role: UserRole): Promise<User[]> {
    return queryDocuments<User>('users', [where('role', '==', role)]);
  }

  static async update(id: string, data: Partial<User>): Promise<void> {
    await updateDocument<User>('users', id, data);
  }

  static async delete(id: string): Promise<void> {
    await deleteDocument('users', id);
  }
}

export class AssignmentService {
  static async add(data: AssignmentInput): Promise<string> {
    const id = await addDocument<Assignment>('assignments', data);
    
    // Aracın durumunu güncelle
    await VehicleService.update(data.vehicleId, {
      status: 'in_use' // 'maintenance' yerine 'in_use' kullanıyoruz
    });
    
    return id;
  }

  static async update(id: string, data: AssignmentUpdate): Promise<void> {
    await updateDocument<Assignment>('assignments', id, data);
    
    // Eğer görev tamamlandı veya iptal edildiyse aracı tekrar aktif yap
    if (data.status === 'completed' || data.status === 'cancelled') {
      const assignment = await this.get(id);
      if (assignment) {
        await VehicleService.update(assignment.vehicleId, {
          status: 'active'
        });
      }
    }
  }

  static async get(id: string): Promise<Assignment | null> {
    return getDocument<Assignment>('assignments', id);
  }

  static async getAll(): Promise<Assignment[]> {
    return queryDocuments<Assignment>('assignments', []);
  }

  static async getByDriver(driverId: string): Promise<Assignment[]> {
    const assignments = await queryDocuments<Assignment>('assignments', [
      where('driverId', '==', driverId)
    ]);
    
    // JavaScript tarafında sıralama yap
    return assignments.sort((a, b) => 
      b.startTime.toDate().getTime() - a.startTime.toDate().getTime()
    );
  }

  static async getByVehicle(vehicleId: string): Promise<Assignment[]> {
    const assignments = await queryDocuments<Assignment>('assignments', [
      where('vehicleId', '==', vehicleId)
    ]);
    
    // JavaScript tarafında sıralama yap
    return assignments.sort((a, b) => 
      b.startTime.toDate().getTime() - a.startTime.toDate().getTime()
    );
  }

  static async delete(id: string): Promise<void> {
    const assignment = await this.get(id);
    if (assignment) {
      await VehicleService.update(assignment.vehicleId, {
        status: 'active'
      });
    }
    await deleteDocument('assignments', id);
  }

  static async checkVehicleAvailability(
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    excludeAssignmentId?: string
  ): Promise<boolean> {
    const assignments = await this.getByVehicle(vehicleId);
    
    // Sadece aktif görevleri kontrol et
    const activeAssignments = assignments.filter(a => 
      a.status === 'active' && 
      (excludeAssignmentId ? a.id !== excludeAssignmentId : true)
    );

    for (const assignment of activeAssignments) {
      const assignmentStart = assignment.startTime.toDate();
      const assignmentEnd = assignment.endTime?.toDate() || new Date(8640000000000000);

      if (
        (startDate >= assignmentStart && startDate <= assignmentEnd) ||
        (endDate >= assignmentStart && endDate <= assignmentEnd) ||
        (startDate <= assignmentStart && endDate >= assignmentEnd)
      ) {
        return false;
      }
    }

    return true;
  }

  static async completeAssignment(id: string, kilometers: number): Promise<void> {
    await this.update(id, {
      status: 'completed',
      kilometers
    });
  }

  static async cancelAssignment(id: string): Promise<void> {
    await this.update(id, {
      status: 'cancelled'
    });
  }
}

export const TireChangeService = {
  add: async (data: TireChangeInput) => {
    return await addDocument<TireChange>('tire_changes', {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  update: async (id: string, data: TireChangeUpdate) => {
    return await updateDocument<TireChange>('tire_changes', id, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  get: async (id: string) => {
    return await getDocument<TireChange>('tire_changes', id);
  },

  getAll: async () => {
    return await queryDocuments<TireChange>('tire_changes', [
      orderBy('date', 'desc')
    ]);
  },

  getByVehicle: async (vehicleId: string) => {
    return await queryDocuments<TireChange>('tire_changes', [
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc')
    ]);
  },

  delete: async (id: string) => {
    return await deleteDocument('tire_changes', id);
  }
};

export const PartChangeService = {
  add: async (data: PartChangeInput) => {
    return await addDocument<PartChange>('part_changes', {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  update: async (id: string, data: PartChangeUpdate) => {
    return await updateDocument<PartChange>('part_changes', id, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  get: async (id: string) => {
    return await getDocument<PartChange>('part_changes', id);
  },

  getAll: async () => {
    return await queryDocuments<PartChange>('part_changes', [
      orderBy('date', 'desc')
    ]);
  },

  getByVehicle: async (vehicleId: string) => {
    return await queryDocuments<PartChange>('part_changes', [
      where('vehicleId', '==', vehicleId),
      orderBy('date', 'desc')
    ]);
  },

  delete: async (id: string) => {
    return await deleteDocument('part_changes', id);
  }
}; 