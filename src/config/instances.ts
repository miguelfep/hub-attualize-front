import { InstanceType } from 'src/types/chat';

export const INSTANCE_CONFIG = {
  operacional: {
    name: 'Operacional',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    textColor: '#1E40AF',
    borderColor: '#93C5FD',
    icon: 'eva:settings-fill',
    allowedRoles: ['operacional', 'admin']
  },
  'financeiro-comercial': {
    name: 'Financeiro/Comercial',
    color: '#10B981',
    bgColor: '#ECFDF5',
    textColor: '#047857',
    borderColor: '#6EE7B7',
    icon: 'eva:credit-card-fill',
    allowedRoles: ['financeiro', 'comercial', 'admin']
  }
} as const;

export const getInstanceConfig = (instanceType: InstanceType) => {
  return INSTANCE_CONFIG[instanceType];
};

export const getAllowedInstances = (userRole: string): InstanceType[] => {
  const allowedInstances: InstanceType[] = [];
  
  Object.entries(INSTANCE_CONFIG).forEach(([instanceType, config]) => {
    if (config.allowedRoles.includes(userRole)) {
      allowedInstances.push(instanceType as InstanceType);
    }
  });
  
  return allowedInstances;
}; 