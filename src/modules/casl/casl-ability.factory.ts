import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User, Referral, Hospital, BedCapacity, Specialist, Patient, AuditLog } from '@prisma/client';
import { Role } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | 'Referral'
  | 'Hospital'
  | 'BedCapacity'
  | 'Specialist'
  | 'Patient'
  | 'AuditLog'
  | 'User'
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: { id: string; role: Role; hospitalId?: string }) {
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.role === Role.SYS_ADMIN) {
      can(Action.Manage, 'Hospital');
      can(Action.Manage, 'User');
      can(Action.Manage, 'AuditLog');
      can(Action.Read, 'Referral'); // Impartial observer for clinical data
      can(Action.Read, 'Patient');
      can(Action.Read, 'BedCapacity');
      can(Action.Read, 'Specialist');
    } else if (user.role === Role.HOSPITAL_ADMIN) {
      can(Action.Read, 'all');
      can(Action.Manage, 'Hospital', { id: user.hospitalId } as any);
      can(Action.Manage, 'BedCapacity', { hospitalId: user.hospitalId } as any);
      can(Action.Manage, 'Specialist', { hospitalId: user.hospitalId } as any);
      can(Action.Update, 'Referral', { receivingHospitalId: user.hospitalId } as any);
      can(Action.Update, 'Referral', { referringHospitalId: user.hospitalId } as any);
    } else if (user.role === Role.FOCAL_PERSON) {
      can(Action.Read, 'all');
      can(Action.Update, 'Referral', { receivingHospitalId: user.hospitalId } as any);
      can(Action.Update, 'Referral', { referringHospitalId: user.hospitalId } as any);
      can(Action.Manage, 'BedCapacity', { hospitalId: user.hospitalId } as any);
      can(Action.Manage, 'Specialist', { hospitalId: user.hospitalId } as any);
    } else if (user.role === Role.CLINICIAN) {
      can(Action.Read, 'Hospital');
      can(Action.Read, 'Patient');
      can(Action.Read, 'BedCapacity');
      can(Action.Read, 'Specialist');
      
      can(Action.Create, 'Referral');
      can(Action.Read, 'Referral', { initiatedById: user.id } as any);
      can(Action.Read, 'Referral', { referringHospitalId: user.hospitalId } as any);
      can(Action.Read, 'Referral', { receivingHospitalId: user.hospitalId } as any);
      can(Action.Update, 'Referral', { initiatedById: user.id } as any);
    }

    // User Management Rules
    if (user.role === Role.SYS_ADMIN) {
      can(Action.Manage, 'User');
    } else if (user.role === Role.HOSPITAL_ADMIN) {
      can(Action.Manage, 'User', { hospitalId: user.hospitalId } as any);
    }

    return build({
      detectSubjectType: (item) => {
        if (typeof item === 'string') return item as Subjects;
        
        // Try to get type from __typename or constructor
        const type = (item as any).__typename || (item as any).constructor.name;
        
        if (type && type !== 'Object') return type as Subjects;

        // Robust property-based fallback for Prisma objects
        if ((item as any).patientId && (item as any).referringHospitalId) return 'Referral';
        if ((item as any).wardType && (item as any).totalBeds !== undefined) return 'BedCapacity';
        if ((item as any).discipline && (item as any).status !== undefined) return 'Specialist';
        if ((item as any).level && (item as any).location) return 'Hospital';
        if ((item as any).email && (item as any).role) return 'User';
        
        return type as Subjects;
      }
    });
  }
}
