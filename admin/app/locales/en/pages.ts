export const pages = {
  home: {
    meta: {
      title: 'Portal Home - React Admin Platform',
      description:
        'Enterprise full-stack modern management and portal platform built on React Router 8 + shadcn',
    },
    ad: {
      badge: 'Featured promotion',
      learnMore: 'Learn more',
    },
    hero: {
      badge: 'Generic portal and site engine fully enabled',
      title: 'Enterprise React Router 8 + shadcn full-stack architecture',
      descriptionPrefix: 'This portal demo live-consumes backend-configured',
      featurePages: 'single-page management',
      featureNav: 'header and footer navigation',
      featureWidgets: 'card widgets',
      featureNotices: 'four-tier operational notice overlays',
      listSeparator: ', ',
      listAnd: ' and ',
      descriptionSuffix: '.',
      ctaAdmin: 'Open admin console',
      ctaAbout: 'Read the platform about page',
      ctaLinks: 'Friend links and partners',
    },
    singlePages: {
      title: 'Published public single pages',
      count: '{{count}} pages in total',
      readMore: 'Read more',
    },
    features: {
      rbacTitle: 'RBAC fine-grained permissions',
      rbacDescription:
        'Closed-loop governance of roles, users and the permission tree, guarding pages, buttons and APIs end to end',
      componentsTitle: 'shadcn atomic components',
      componentsDescription:
        '47 components fully built in-house, no bloated third-party dependencies, native React 19 performance',
      widgetsTitle: 'Card widget assembly',
      widgetsDescription:
        'Out-of-the-box dynamic mounting, enable/disable and weighted ordering of card widgets, shown on the home page and single pages on demand',
    },
  },
  links: {
    hero: {
      badge: 'Partner network and ecosystem',
      title: 'Friend links and partner network',
      description:
        'Open collaboration and shared growth, gathering cutting-edge full-stack teams, open-source projects, developer blogs and tech news portals',
      apply: 'Apply for a link exchange',
      backHome: 'Back to portal home',
    },
    sites: {
      title: 'Partner sites',
      count: '{{count}} tech sites in total',
      loading: 'Loading partner sites...',
      empty: 'No friend links to show yet',
      emptyCta: 'Be the first to exchange friend links',
      fallbackDescription:
        'A quality tech community and open interconnection site',
    },
  },
  layout: {
    header: {
      adminCta: 'Open admin console',
    },
    footer: {
      ungroupedTitle: 'Other links',
      description:
        'A modern universal admin and portal engine built on React Router 8.3 + React 19, with RBAC fine-grained permission control and dynamic card widget assembly',
      statusOk: 'All system services are running normally',
      noLinks: 'No links yet',
      backToTop: 'Back to top ↑',
    },
  },
  singlePage: {
    loading: 'Loading page content...',
    notFoundTitle: '404 - Page not found',
    notFoundDescription:
      'This page does not exist or has not been published yet. Please check the URL.',
    backHome: 'Back to home',
    goAdmin: 'Go to admin',
    breadcrumbHome: 'Home',
    updatedAt: 'Updated {{date}}',
    views: '{{views}} views',
    slugLabel: 'Slug: /{{slug}}',
  },
  admin: {
    requiredHint: 'Fields marked * are required',
    users: {
      metaTitle: 'User Management - Admin Framework',
      title: 'User management',
      description:
        'Manage platform members, assign permission roles and maintain account status',
      createAction: 'New user',
      createMetaTitle: 'Create User - Admin Framework',
      createTitle: 'Create a system user',
      createDescription:
        'Fill in user details to create a new account and grant system permissions',
      createCardTitle: 'Basic info and permission settings',
      createSubmit: 'Create now',
      createSuccess: 'User "{{name}}" created successfully',
      createFailed: 'Failed to create user, please check the input',
      detailMetaTitle: 'User Details - Admin Framework',
      detailTitle: 'User details',
      detailHeading: 'User details: {{name}}',
      idDescription: 'System unique identifier (ID): {{id}}',
      loadingDetail: 'Loading user details...',
      loadingProfile: 'Loading user profile...',
      notFoundTitle: 'User not found',
      notFoundDescription:
        'This user may have been deleted or the ID is invalid',
      backToList: 'Back to list',
      editAction: 'Edit user',
      editMetaTitle: 'Edit User - Admin Framework',
      editTitle: 'Edit user',
      editHeading: 'Edit user: {{name}}',
      editDescription:
        'Update profile details, reassign permission roles or adjust account status',
      editCardTitle: 'Edit user information',
      idLabel: 'User ID: {{id}}',
      editSubmit: 'Save changes',
      updateSuccess: 'User updated successfully',
      updateFailed: 'Failed to update user',
      identityCard: 'Identity overview',
      attributesCard: 'Detailed attributes',
      fields: {
        role: 'Role',
        bio: 'Bio / Notes',
      },
      noBio: 'No bio yet',
      roles: {
        superAdmin: 'Super admin',
        admin: 'Admin',
        manager: 'Manager',
        user: 'User',
      },
      status: {
        active: 'Active',
        inactive: 'Not activated',
        suspended: 'Suspended',
      },
    },
    roles: {
      metaTitle: 'Roles & Permissions - Admin Framework',
      title: 'Roles & permissions',
      heading: 'Role and permission management',
      description:
        'Define access control policies and maintain operation privileges and permission matrices for different positions',
      createAction: 'New role',
      createMetaTitle: 'Create Role - Admin Framework',
      createTitle: 'Create a role',
      createDescription:
        'Define the role name and unique code identifier, then assign its permission matrix',
      createCardTitle: 'Role attributes and permission assignment',
      createSubmit: 'Create role',
      createSuccess: 'Role "{{name}}" created successfully',
      createFailed: 'Failed to create role, please check the input',
      editMetaTitle: 'Edit Role - Admin Framework',
      editTitle: 'Edit role',
      editHeading: 'Edit role: {{name}}',
      editDescription:
        'Adjust the role definition and re-plan its system permission scope',
      editCardTitle: 'Role info and permission matrix',
      idLabel: 'Role ID: {{id}}',
      systemRoleNote:
        'Note: this is a protected built-in system role and its identifier cannot be changed',
      editSubmit: 'Save role changes',
      updateSuccess: 'Role info and permission configuration updated',
      updateFailed: 'Failed to update role',
      loading: 'Loading role and permission data...',
      notFoundTitle: 'Role not found',
      notFoundDescription:
        'This role may have been removed or the ID is invalid',
      backToList: 'Back to roles',
    },
    sitePages: {
      metaTitle: 'Single Pages - Admin Framework',
      title: 'Single pages',
      description:
        'Manage public standalone static pages such as privacy policy, terms of use, about us and disclaimer',
      createAction: 'New page',
      createMetaTitle: 'Create Page - Admin Framework',
      createDescription:
        'Set the page title, public slug, Markdown body content and SEO keywords',
      createCardTitle: 'Page basics and SEO settings',
      createSubmit: 'Save and publish',
      createSuccess: 'Page "{{title}}" created successfully',
      createFailed: 'Failed to create page, please check for slug conflicts',
      editMetaTitle: 'Edit Page - Admin Framework',
      editTitle: 'Edit page',
      editHeading: 'Edit page: {{title}}',
      viewMeta: 'Public URL: /{{slug}} · Views: {{views}}',
      editCardTitle: 'Page attributes and content',
      idLabel: 'Page identifier: {{id}}',
      editSubmit: 'Save page changes',
      updateSuccess: 'Page updated successfully',
      updateFailed: 'Failed to save page',
      loading: 'Loading page data...',
      notFoundTitle: 'Page not found',
      notFoundDescription: 'This page may have been deleted or the ID is wrong',
      backToList: 'Back to pages',
    },
    media: {
      metaTitle: 'Media Library - Admin Framework',
      title: 'Media library',
      heading: 'Media resource center',
      description:
        'Centrally manage site images, documents, audio/video and archive attachments with category filtering and direct-link copying',
      loading: 'Loading media assets...',
      loadFailed: 'Failed to load media assets',
      deleteSuccess: 'Asset "{{name}}" deleted',
      deleteFailed: 'Delete failed',
      batchDeleteSuccess: 'Successfully deleted {{count}} assets in batch',
      batchDeleteFailed: 'Batch delete failed',
      updateSuccess: 'Asset properties updated',
      updateFailed: 'Update failed',
      copySuccess: 'Direct link copied to clipboard',
      linkInfo: 'Link: {{url}}',
    },
    friendLinks: {
      title: 'Friend links',
      description:
        'Review friend-link applications submitted from the public site and maintain the partner network shown there',
    },
    navigation: {
      metaTitle: 'Navigation Settings - Admin Framework',
      title: 'Navigation settings',
      heading: 'Front-site navigation management',
      description:
        'Visually configure the public header main menu, footer link groups and link open rules',
    },
    operations: {
      metaTitle: 'Operations & Ads - Admin Framework',
      title: 'Operations & ads',
      heading: 'Operations notices and advertising center',
      description:
        'Manage pop-up notices, sticky banners, floating cards, the bottom marquee and promo ad slots (create, edit, delete and enable/disable)',
      tabNotices: 'Notice matrix (4 types)',
      tabAds: 'Ad slots and promotions',
    },
    widgets: {
      metaTitle: 'Card Widgets - Admin Framework',
      title: 'Card widgets',
      heading: 'Card widget assembly center',
      description:
        'Create, edit, delete and configure dynamic widget cards shown in the admin dashboard and the public portal sidebar',
    },
  },
  dashboard: 'Dashboard',
}
