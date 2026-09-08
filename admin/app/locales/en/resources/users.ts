export const usersResources = {
  title: 'Users',
  label: 'User management',
  pluralLabel: 'User list',
  navGroup: 'System management',
  module: {
    label: 'User center module',
    description:
      'Core user business covering user management, role assignment and account status changes',
  },
  roles: {
    superAdmin: 'Super admin',
    admin: 'Admin',
    manager: 'Manager',
    user: 'User',
  },
  status: {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  },
  form: {
    submit: 'Save user',
    cancelAndReturn: 'Cancel and return',
    assignRole: 'Assign role',
    accountStatus: 'Account status',
    bioLabel: 'Bio / notes',
    namePlaceholder: 'Enter a real name or nickname',
    bioPlaceholder: 'Add notes or responsibilities for this user...',
    selectRole: 'Select role',
    selectStatus: 'Select status',
  },
  options: {
    role: {
      superAdmin: 'Super admin (super_admin)',
      admin: 'Admin (admin)',
      manager: 'Manager (manager)',
      user: 'User (user)',
    },
    status: {
      active: 'Active (active)',
      inactive: 'Inactive (inactive)',
      suspended: 'Suspended (suspended)',
    },
  },
  table: {
    role: 'Role',
    status: 'Status',
    searchPlaceholder: 'Search users by name...',
  },
  messages: {
    deleteSuccess: 'User "{{title}}" deleted successfully',
    deleteFailed: 'Delete failed',
    bulkDeleteSuccess: 'Successfully deleted {{count}} users',
    bulkDeleteFailed: 'Bulk delete failed',
  },
  errors: {
    emailInUse:
      'Email "{{email}}" is already in use, please use a different email',
    emailTakenByOther: 'Email "{{email}}" is already taken by another user',
  },
}
