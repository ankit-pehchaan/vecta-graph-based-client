import type { FinancialProfile, PersonalInfo } from '../services/api';

interface PersonalInfoPanelProps {
  profile: FinancialProfile | null;
}

export default function PersonalInfoPanel({ profile }: PersonalInfoPanelProps) {
  const personalInfo: PersonalInfo | undefined = profile?.personal_info;
  const metadata = profile?.metadata;
  const discoveredFacts = metadata?.discovered_facts || {};

  // Merge personal_info with discovered_facts (discovered_facts takes precedence for missing fields)
  const mergedInfo: PersonalInfo = {
    ...personalInfo,
    age: personalInfo?.age || discoveredFacts.age,
    marital_status: personalInfo?.marital_status || discoveredFacts.marital_status || discoveredFacts.family_status,
    location: personalInfo?.location || discoveredFacts.location,
    occupation: personalInfo?.occupation || discoveredFacts.occupation,
    employment_status: personalInfo?.employment_status || discoveredFacts.employment_status,
    partner_occupation: personalInfo?.partner_occupation || discoveredFacts.partner_occupation,
    partner_income: personalInfo?.partner_income || discoveredFacts.partner_income,
    partner_employment_status: personalInfo?.partner_employment_status || discoveredFacts.partner_employment_status,
    dependents: personalInfo?.dependents || discoveredFacts.dependents,
    children_count: personalInfo?.children_count || discoveredFacts.children_count,
    children_ages: personalInfo?.children_ages || discoveredFacts.children_ages,
    children_status: personalInfo?.children_status || discoveredFacts.children_status,
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatEmploymentStatus = (status: string | undefined) => {
    if (!status) return 'N/A';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatMaritalStatus = (status: string | undefined) => {
    if (!status) return 'N/A';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const hasPersonalInfo = mergedInfo.age || mergedInfo.marital_status || mergedInfo.location || mergedInfo.occupation;
  const hasFamilyInfo = mergedInfo.marital_status || mergedInfo.partner_occupation || mergedInfo.children_count;

  if (!hasPersonalInfo && !hasFamilyInfo) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Personal Information</h3>
        <p className="text-sm text-gray-500">Personal information will appear here as you chat...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Personal Details Section */}
      {(mergedInfo.age || mergedInfo.location || mergedInfo.occupation || mergedInfo.employment_status) && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Details</h3>
          <div className="space-y-2">
            {mergedInfo.age && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.age} years</span>
              </div>
            )}
            {mergedInfo.location && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.location}</span>
              </div>
            )}
            {mergedInfo.occupation && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Occupation</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.occupation}</span>
              </div>
            )}
            {mergedInfo.employment_status && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Employment Status</span>
                <span className="text-sm font-medium text-gray-900">{formatEmploymentStatus(mergedInfo.employment_status)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family Details Section */}
      {(mergedInfo.marital_status || mergedInfo.partner_occupation || mergedInfo.partner_income || mergedInfo.children_count) && (
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Family Details</h3>
          <div className="space-y-2">
            {mergedInfo.marital_status && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Marital Status</span>
                <span className="text-sm font-medium text-gray-900">{formatMaritalStatus(mergedInfo.marital_status)}</span>
              </div>
            )}
            {mergedInfo.partner_occupation && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Partner Occupation</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.partner_occupation}</span>
              </div>
            )}
            {mergedInfo.partner_income !== undefined && mergedInfo.partner_income !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Partner Income</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(mergedInfo.partner_income)}</span>
              </div>
            )}
            {mergedInfo.partner_employment_status && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Partner Employment</span>
                <span className="text-sm font-medium text-gray-900">{formatEmploymentStatus(mergedInfo.partner_employment_status)}</span>
              </div>
            )}
            {mergedInfo.dependents !== undefined && mergedInfo.dependents !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dependents</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.dependents}</span>
              </div>
            )}
            {mergedInfo.children_count !== undefined && mergedInfo.children_count !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Children</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.children_count}</span>
              </div>
            )}
            {mergedInfo.children_ages && mergedInfo.children_ages.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Children Ages</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.children_ages.join(', ')} years</span>
              </div>
            )}
            {mergedInfo.children_status && mergedInfo.children_status.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Children Status</span>
                <span className="text-sm font-medium text-gray-900">{mergedInfo.children_status.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


