export const rolesResources = {
  title: 'Roles',
  label: 'Roles & Permissions',
  pluralLabel: 'Roles',
  navigationGroup: 'System Management',
  module: {
    label: 'Roles & permissions module',
    description:
      'RBAC-based role configuration, permission dictionary, matrix assignment and authorization',
  },
  form: {
    submitDefault: 'Save role',
    cancelBack: 'Cancel and go back',
  },
  fields: {
    name: 'Role name',
    namePlaceholder: 'e.g. Operations manager, Finance specialist',
    code: 'Role code',
    codePlaceholder: 'e.g. operation_manager',
    codeDescription:
      'Unique English identifier, not recommended to change after creation',
    description: 'Role purpose and responsibilities',
    descriptionPlaceholder:
      'Briefly describe the responsibilities and permission scope of this role...',
    permissions: 'Permissions',
  },
  table: {
    name: 'Role name',
    systemBadge: 'Built-in',
    description: 'Purpose and description',
    permissions: 'Permissions',
    fullAccess: 'Full access (*)',
    permissionCount: '{{count}} permissions',
    searchPlaceholder: 'Search by role name or code...',
  },
  matrix: {
    title: 'Permission assignment matrix',
    superBadge: 'Super privilege (*)',
    clearAll: 'Clear all',
    selectGroup: 'Select all in group',
    deselectGroup: 'Deselect all in group',
  },
  messages: {
    deleteSuccess: 'Role "{{name}}" has been deleted successfully',
    deleteFailed: 'Failed to delete role',
    deleteConfirmDescription:
      'This role will be permanently deleted. Users assigned to this role will lose the corresponding permissions.',
    bulkDeleteSuccess: 'Deleted {{count}} custom roles successfully',
    bulkDeleteSkipped: 'Skipped {{count}} protected system roles',
    bulkDeleteFailed: 'Bulk delete failed',
  },
  errors: {
    codeTaken: 'Role code "{{code}}" is already taken, please use another one',
    codeTakenByOther: 'Role code "{{code}}" is already used by another role',
    notFound: 'Role does not exist or has been deleted',
    systemProtected:
      'System role "{{name}}" is protected and cannot be deleted',
  },
  validation: {
    nameMin: 'Role name must be at least 2 characters',
    codeMin: 'Role code must be at least 2 characters',
    codeFormat:
      'Role code only supports letters, numbers, underscores and hyphens',
  },
}
