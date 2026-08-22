import { relations } from "drizzle-orm/relations";
import { constructionProjects, baladyPermits, tenants, bimModels, paymentCertificates, certificateApprovals, users, claimsChangeOrders, constructionAnalytics, costVarianceAlerts, jobCostingDetails, cpmTasks, employeeLeaveRequests, employeeTimesheets, equipmentMaintenance, equipmentUsage, hseKpiMetrics, hseSafetyIncidents, jobCostingCategories, wbsItems, ncrNonconformances, nitaqatComplianceAlerts, nitaqatTracking, progressBilling, performanceMetrics, portalMessages, portalUsers, portalNotifications, portalSessions, portfolioMetrics, predictiveAnalytics, punchLists, qiwaIntegration, rfiRequests, visaExpiryAlerts, workerVisaStatus, visaQuotaTracking, wipCalculation } from "./schema";

export const baladyPermitsRelations = relations(baladyPermits, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [baladyPermits.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [baladyPermits.tenantId],
		references: [tenants.id]
	}),
}));

export const constructionProjectsRelations = relations(constructionProjects, ({many}) => ({
	baladyPermits: many(baladyPermits),
	bimModels: many(bimModels),
	claimsChangeOrders: many(claimsChangeOrders),
	constructionAnalytics: many(constructionAnalytics),
	costVarianceAlerts: many(costVarianceAlerts),
	cpmTasks: many(cpmTasks),
	employeeTimesheets: many(employeeTimesheets),
	equipmentMaintenances_projectId: many(equipmentMaintenance, {
		relationName: "equipmentMaintenance_projectId_constructionProjects_id"
	}),
	equipmentMaintenances_projectId: many(equipmentMaintenance, {
		relationName: "equipmentMaintenance_projectId_constructionProjects_id"
	}),
	equipmentUsages_projectId: many(equipmentUsage, {
		relationName: "equipmentUsage_projectId_constructionProjects_id"
	}),
	equipmentUsages_projectId: many(equipmentUsage, {
		relationName: "equipmentUsage_projectId_constructionProjects_id"
	}),
	hseKpiMetrics: many(hseKpiMetrics),
	hseSafetyIncidents: many(hseSafetyIncidents),
	jobCostingDetails: many(jobCostingDetails),
	ncrNonconformances: many(ncrNonconformances),
	nitaqatComplianceAlerts: many(nitaqatComplianceAlerts),
	nitaqatTrackings: many(nitaqatTracking),
	performanceMetrics: many(performanceMetrics),
	predictiveAnalytics: many(predictiveAnalytics),
	punchLists: many(punchLists),
	rfiRequests: many(rfiRequests),
	visaExpiryAlerts: many(visaExpiryAlerts),
	visaQuotaTrackings: many(visaQuotaTracking),
	wipCalculations: many(wipCalculation),
	workerVisaStatuses: many(workerVisaStatus),
}));

export const tenantsRelations = relations(tenants, ({many}) => ({
	baladyPermits: many(baladyPermits),
	bimModels: many(bimModels),
	claimsChangeOrders: many(claimsChangeOrders),
	constructionAnalytics: many(constructionAnalytics),
	costVarianceAlerts: many(costVarianceAlerts),
	cpmTasks: many(cpmTasks),
	employeeLeaveRequests: many(employeeLeaveRequests),
	employeeTimesheets: many(employeeTimesheets),
	equipmentMaintenances: many(equipmentMaintenance),
	equipmentUsages: many(equipmentUsage),
	hseKpiMetrics: many(hseKpiMetrics),
	hseSafetyIncidents: many(hseSafetyIncidents),
	jobCostingCategories: many(jobCostingCategories),
	jobCostingDetails: many(jobCostingDetails),
	ncrNonconformances: many(ncrNonconformances),
	nitaqatComplianceAlerts: many(nitaqatComplianceAlerts),
	nitaqatTrackings: many(nitaqatTracking),
	paymentCertificates: many(paymentCertificates),
	performanceMetrics: many(performanceMetrics),
	portfolioMetrics: many(portfolioMetrics),
	predictiveAnalytics: many(predictiveAnalytics),
	punchLists: many(punchLists),
	qiwaIntegrations: many(qiwaIntegration),
	rfiRequests: many(rfiRequests),
	visaExpiryAlerts: many(visaExpiryAlerts),
	visaQuotaTrackings: many(visaQuotaTracking),
	wipCalculations: many(wipCalculation),
	workerVisaStatuses: many(workerVisaStatus),
}));

export const bimModelsRelations = relations(bimModels, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [bimModels.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [bimModels.tenantId],
		references: [tenants.id]
	}),
}));

export const certificateApprovalsRelations = relations(certificateApprovals, ({one}) => ({
	paymentCertificate: one(paymentCertificates, {
		fields: [certificateApprovals.certificateId],
		references: [paymentCertificates.id]
	}),
	user: one(users, {
		fields: [certificateApprovals.approverUserId],
		references: [users.id]
	}),
}));

export const paymentCertificatesRelations = relations(paymentCertificates, ({one, many}) => ({
	certificateApprovals: many(certificateApprovals),
	tenant: one(tenants, {
		fields: [paymentCertificates.tenantId],
		references: [tenants.id]
	}),
	progressBilling: one(progressBilling, {
		fields: [paymentCertificates.progressBillingId],
		references: [progressBilling.id]
	}),
	user: one(users, {
		fields: [paymentCertificates.createdBy],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	certificateApprovals: many(certificateApprovals),
	costVarianceAlerts: many(costVarianceAlerts),
	hseSafetyIncidents: many(hseSafetyIncidents),
	paymentCertificates: many(paymentCertificates),
	visaExpiryAlerts: many(visaExpiryAlerts),
	workerVisaStatuses: many(workerVisaStatus),
}));

export const claimsChangeOrdersRelations = relations(claimsChangeOrders, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [claimsChangeOrders.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [claimsChangeOrders.tenantId],
		references: [tenants.id]
	}),
}));

export const constructionAnalyticsRelations = relations(constructionAnalytics, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [constructionAnalytics.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [constructionAnalytics.tenantId],
		references: [tenants.id]
	}),
}));

export const costVarianceAlertsRelations = relations(costVarianceAlerts, ({one}) => ({
	tenant: one(tenants, {
		fields: [costVarianceAlerts.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [costVarianceAlerts.projectId],
		references: [constructionProjects.id]
	}),
	jobCostingDetail: one(jobCostingDetails, {
		fields: [costVarianceAlerts.jobCostingDetailId],
		references: [jobCostingDetails.id]
	}),
	user: one(users, {
		fields: [costVarianceAlerts.resolvedBy],
		references: [users.id]
	}),
}));

export const jobCostingDetailsRelations = relations(jobCostingDetails, ({one, many}) => ({
	costVarianceAlerts: many(costVarianceAlerts),
	tenant: one(tenants, {
		fields: [jobCostingDetails.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [jobCostingDetails.projectId],
		references: [constructionProjects.id]
	}),
	wbsItem: one(wbsItems, {
		fields: [jobCostingDetails.wbsItemId],
		references: [wbsItems.id]
	}),
	jobCostingCategory: one(jobCostingCategories, {
		fields: [jobCostingDetails.costCategoryId],
		references: [jobCostingCategories.id]
	}),
}));

export const cpmTasksRelations = relations(cpmTasks, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [cpmTasks.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [cpmTasks.tenantId],
		references: [tenants.id]
	}),
}));

export const employeeLeaveRequestsRelations = relations(employeeLeaveRequests, ({one}) => ({
	tenant: one(tenants, {
		fields: [employeeLeaveRequests.tenantId],
		references: [tenants.id]
	}),
}));

export const employeeTimesheetsRelations = relations(employeeTimesheets, ({one}) => ({
	tenant: one(tenants, {
		fields: [employeeTimesheets.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [employeeTimesheets.projectId],
		references: [constructionProjects.id]
	}),
}));

export const equipmentMaintenanceRelations = relations(equipmentMaintenance, ({one}) => ({
	constructionProject_projectId: one(constructionProjects, {
		fields: [equipmentMaintenance.projectId],
		references: [constructionProjects.id],
		relationName: "equipmentMaintenance_projectId_constructionProjects_id"
	}),
	tenant: one(tenants, {
		fields: [equipmentMaintenance.tenantId],
		references: [tenants.id]
	}),
	constructionProject_projectId: one(constructionProjects, {
		fields: [equipmentMaintenance.projectId],
		references: [constructionProjects.id],
		relationName: "equipmentMaintenance_projectId_constructionProjects_id"
	}),
}));

export const equipmentUsageRelations = relations(equipmentUsage, ({one}) => ({
	constructionProject_projectId: one(constructionProjects, {
		fields: [equipmentUsage.projectId],
		references: [constructionProjects.id],
		relationName: "equipmentUsage_projectId_constructionProjects_id"
	}),
	tenant: one(tenants, {
		fields: [equipmentUsage.tenantId],
		references: [tenants.id]
	}),
	constructionProject_projectId: one(constructionProjects, {
		fields: [equipmentUsage.projectId],
		references: [constructionProjects.id],
		relationName: "equipmentUsage_projectId_constructionProjects_id"
	}),
}));

export const hseKpiMetricsRelations = relations(hseKpiMetrics, ({one}) => ({
	tenant: one(tenants, {
		fields: [hseKpiMetrics.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [hseKpiMetrics.projectId],
		references: [constructionProjects.id]
	}),
}));

export const hseSafetyIncidentsRelations = relations(hseSafetyIncidents, ({one}) => ({
	tenant: one(tenants, {
		fields: [hseSafetyIncidents.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [hseSafetyIncidents.projectId],
		references: [constructionProjects.id]
	}),
	user: one(users, {
		fields: [hseSafetyIncidents.reportedBy],
		references: [users.id]
	}),
}));

export const jobCostingCategoriesRelations = relations(jobCostingCategories, ({one, many}) => ({
	tenant: one(tenants, {
		fields: [jobCostingCategories.tenantId],
		references: [tenants.id]
	}),
	jobCostingDetails: many(jobCostingDetails),
}));

export const wbsItemsRelations = relations(wbsItems, ({many}) => ({
	jobCostingDetails: many(jobCostingDetails),
}));

export const ncrNonconformancesRelations = relations(ncrNonconformances, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [ncrNonconformances.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [ncrNonconformances.tenantId],
		references: [tenants.id]
	}),
}));

export const nitaqatComplianceAlertsRelations = relations(nitaqatComplianceAlerts, ({one}) => ({
	tenant: one(tenants, {
		fields: [nitaqatComplianceAlerts.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [nitaqatComplianceAlerts.projectId],
		references: [constructionProjects.id]
	}),
}));

export const nitaqatTrackingRelations = relations(nitaqatTracking, ({one}) => ({
	tenant: one(tenants, {
		fields: [nitaqatTracking.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [nitaqatTracking.projectId],
		references: [constructionProjects.id]
	}),
}));

export const progressBillingRelations = relations(progressBilling, ({many}) => ({
	paymentCertificates: many(paymentCertificates),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [performanceMetrics.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [performanceMetrics.tenantId],
		references: [tenants.id]
	}),
}));

export const portalMessagesRelations = relations(portalMessages, ({one, many}) => ({
	portalMessage: one(portalMessages, {
		fields: [portalMessages.parentId],
		references: [portalMessages.id],
		relationName: "portalMessages_parentId_portalMessages_id"
	}),
	portalMessages: many(portalMessages, {
		relationName: "portalMessages_parentId_portalMessages_id"
	}),
}));

export const portalNotificationsRelations = relations(portalNotifications, ({one}) => ({
	portalUser: one(portalUsers, {
		fields: [portalNotifications.portalUserId],
		references: [portalUsers.id]
	}),
}));

export const portalUsersRelations = relations(portalUsers, ({many}) => ({
	portalNotifications: many(portalNotifications),
	portalSessions: many(portalSessions),
}));

export const portalSessionsRelations = relations(portalSessions, ({one}) => ({
	portalUser: one(portalUsers, {
		fields: [portalSessions.portalUserId],
		references: [portalUsers.id]
	}),
}));

export const portfolioMetricsRelations = relations(portfolioMetrics, ({one}) => ({
	tenant: one(tenants, {
		fields: [portfolioMetrics.tenantId],
		references: [tenants.id]
	}),
}));

export const predictiveAnalyticsRelations = relations(predictiveAnalytics, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [predictiveAnalytics.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [predictiveAnalytics.tenantId],
		references: [tenants.id]
	}),
}));

export const punchListsRelations = relations(punchLists, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [punchLists.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [punchLists.tenantId],
		references: [tenants.id]
	}),
}));

export const qiwaIntegrationRelations = relations(qiwaIntegration, ({one}) => ({
	tenant: one(tenants, {
		fields: [qiwaIntegration.tenantId],
		references: [tenants.id]
	}),
}));

export const rfiRequestsRelations = relations(rfiRequests, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [rfiRequests.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [rfiRequests.tenantId],
		references: [tenants.id]
	}),
}));

export const visaExpiryAlertsRelations = relations(visaExpiryAlerts, ({one}) => ({
	tenant: one(tenants, {
		fields: [visaExpiryAlerts.tenantId],
		references: [tenants.id]
	}),
	workerVisaStatus: one(workerVisaStatus, {
		fields: [visaExpiryAlerts.workerVisaStatusId],
		references: [workerVisaStatus.id]
	}),
	user: one(users, {
		fields: [visaExpiryAlerts.employeeId],
		references: [users.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [visaExpiryAlerts.projectId],
		references: [constructionProjects.id]
	}),
}));

export const workerVisaStatusRelations = relations(workerVisaStatus, ({one, many}) => ({
	visaExpiryAlerts: many(visaExpiryAlerts),
	tenant: one(tenants, {
		fields: [workerVisaStatus.tenantId],
		references: [tenants.id]
	}),
	user: one(users, {
		fields: [workerVisaStatus.employeeId],
		references: [users.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [workerVisaStatus.projectId],
		references: [constructionProjects.id]
	}),
}));

export const visaQuotaTrackingRelations = relations(visaQuotaTracking, ({one}) => ({
	tenant: one(tenants, {
		fields: [visaQuotaTracking.tenantId],
		references: [tenants.id]
	}),
	constructionProject: one(constructionProjects, {
		fields: [visaQuotaTracking.projectId],
		references: [constructionProjects.id]
	}),
}));

export const wipCalculationRelations = relations(wipCalculation, ({one}) => ({
	constructionProject: one(constructionProjects, {
		fields: [wipCalculation.projectId],
		references: [constructionProjects.id]
	}),
	tenant: one(tenants, {
		fields: [wipCalculation.tenantId],
		references: [tenants.id]
	}),
}));