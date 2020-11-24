import * as t from 'io-ts'

export const Query = t.union([
  t.record(t.literal('codeOfConduct'), t.undefined),
  t.record(
    t.literal('codesOfConduct'),
    t.type({
      body: t.string,
      id: t.string,
      key: t.string,
      name: t.string,
      resourcePath: t.string,
      url: t.string
    })
  ),
  t.record(t.literal('enterprise'), t.undefined),
  t.record(t.literal('enterpriseAdministratorInvitation'), t.undefined),
  t.record(t.literal('enterpriseAdministratorInvitationByToken'), t.undefined),
  t.record(t.literal('license'), t.undefined),
  t.record(
    t.literal('licenses'),
    t.type({
      body: t.string,
      conditions: t.string,
      description: t.string,
      featured: t.boolean,
      hidden: t.boolean,
      id: t.string,
      implementation: t.string,
      key: t.string,
      limitations: t.string,
      name: t.string,
      nickname: t.string,
      permissions: t.string,
      pseudoLicense: t.boolean,
      spdxId: t.string,
      url: t.string
    })
  ),
  t.record(
    t.literal('marketplaceCategories'),
    t.type({
      description: t.string,
      howItWorks: t.string,
      id: t.string,
      name: t.string,
      primaryListingCount: t.number,
      resourcePath: t.string,
      secondaryListingCount: t.number,
      slug: t.string,
      url: t.string
    })
  ),
  t.record(t.literal('marketplaceCategory'), t.undefined),
  t.record(t.literal('marketplaceListing'), t.undefined),
  t.record(
    t.literal('marketplaceListings'),
    t.type({
      edges: t.string,
      nodes: t.string,
      pageInfo: t.string,
      totalCount: t.number
    })
  ),
  t.record(
    t.literal('meta'),
    t.type({
      gitHubServicesSha: t.string,
      gitIpAddresses: t.string,
      hookIpAddresses: t.string,
      importerIpAddresses: t.string,
      isPasswordAuthenticationVerifiable: t.boolean,
      pagesIpAddresses: t.string
    })
  ),
  t.record(t.literal('node'), t.undefined),
  t.record(
    t.literal('nodes'),
    t.type({
      id: t.string
    })
  ),
  t.record(t.literal('organization'), t.undefined),
  t.record(t.literal('rateLimit'), t.undefined),
  t.record(
    t.literal('relay'),
    t.type({
      codeOfConduct: t.string,
      codesOfConduct: t.string,
      enterprise: t.string,
      enterpriseAdministratorInvitation: t.string,
      enterpriseAdministratorInvitationByToken: t.string,
      license: t.string,
      licenses: t.string,
      marketplaceCategories: t.string,
      marketplaceCategory: t.string,
      marketplaceListing: t.string,
      marketplaceListings: t.string,
      meta: t.string,
      node: t.string,
      nodes: t.string,
      organization: t.string,
      rateLimit: t.string,
      relay: t.string,
      repository: t.string,
      repositoryOwner: t.string,
      resource: t.string,
      search: t.string,
      securityAdvisories: t.string,
      securityAdvisory: t.string,
      securityVulnerabilities: t.string,
      sponsorsListing: t.string,
      topic: t.string,
      user: t.string,
      viewer: t.string,
      resolution: t.string
    })
  ),
  t.record(t.literal('repository'), t.undefined),
  t.record(t.literal('repositoryOwner'), t.undefined),
  t.record(t.literal('resource'), t.undefined),
  t.record(
    t.literal('search'),
    t.type({
      codeCount: t.number,
      edges: t.string,
      issueCount: t.number,
      nodes: t.string,
      pageInfo: t.string,
      repositoryCount: t.number,
      userCount: t.number,
      wikiCount: t.number
    })
  ),
  t.record(
    t.literal('securityAdvisories'),
    t.type({
      edges: t.string,
      nodes: t.string,
      pageInfo: t.string,
      totalCount: t.number
    })
  ),
  t.record(t.literal('securityAdvisory'), t.undefined),
  t.record(
    t.literal('securityVulnerabilities'),
    t.type({
      edges: t.string,
      nodes: t.string,
      pageInfo: t.string,
      totalCount: t.number
    })
  ),
  t.record(t.literal('sponsorsListing'), t.undefined),
  t.record(t.literal('topic'), t.undefined),
  t.record(t.literal('user'), t.undefined),
  t.record(
    t.literal('viewer'),
    t.type({
      anyPinnableItems: t.boolean,
      avatarUrl: t.string,
      bio: t.string,
      bioHTML: t.string,
      commitComments: t.string,
      company: t.string,
      companyHTML: t.string,
      contributionsCollection: t.string,
      createdAt: t.string,
      databaseId: t.number,
      email: t.string,
      followers: t.string,
      following: t.string,
      gist: t.string,
      gistComments: t.string,
      gists: t.string,
      hovercard: t.string,
      id: t.string,
      isBountyHunter: t.boolean,
      isCampusExpert: t.boolean,
      isDeveloperProgramMember: t.boolean,
      isEmployee: t.boolean,
      isHireable: t.boolean,
      isSiteAdmin: t.boolean,
      isViewer: t.boolean,
      issueComments: t.string,
      issues: t.string,
      itemShowcase: t.string,
      location: t.string,
      login: t.string,
      name: t.string,
      organization: t.string,
      organizations: t.string,
      pinnableItems: t.string,
      pinnedItems: t.string,
      pinnedItemsRemaining: t.number,
      pinnedRepositories: t.string,
      project: t.string,
      projects: t.string,
      projectsResourcePath: t.string,
      projectsUrl: t.string,
      publicKeys: t.string,
      pullRequests: t.string,
      registryPackages: t.string,
      registryPackagesForQuery: t.string,
      repositories: t.string,
      repositoriesContributedTo: t.string,
      repository: t.string,
      resourcePath: t.string,
      savedReplies: t.string,
      sponsorshipsAsMaintainer: t.string,
      sponsorshipsAsSponsor: t.string,
      starredRepositories: t.string,
      status: t.string,
      topRepositories: t.string,
      updatedAt: t.string,
      url: t.string,
      viewerCanChangePinnedItems: t.boolean,
      viewerCanCreateProjects: t.boolean,
      viewerCanFollow: t.boolean,
      viewerIsFollowing: t.boolean,
      watching: t.string,
      websiteUrl: t.string
    })
  ),
  t.record(
    t.literal('resolution'),
    t.type({
      hash: t.string,
      time: t.string
    })
  ),
])