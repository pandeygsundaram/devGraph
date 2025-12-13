'use client';

import { useEffect, useState } from 'react';
import { useVisaStore } from '@/lib/stores/visaStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Globe, FileText, Clock, Calendar, DollarSign, X } from 'lucide-react';
import type { Country, VisaType } from '@/types';

export default function VisaConfigPage() {
  const { countries, fetchCountries, isLoading } = useVisaStore();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<VisaType | null>(null);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setSelectedVisa(null);
  };

  const handleVisaClick = (visa: VisaType) => {
    setSelectedVisa(visa);
  };

  const handleBack = () => {
    if (selectedVisa) {
      setSelectedVisa(null);
    } else if (selectedCountry) {
      setSelectedCountry(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Visa Explorer</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Browse available countries and visa types
          </p>
        </div>
        {(selectedCountry || selectedVisa) && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
      </div>

      {!selectedCountry && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country) => (
            <Card
              key={country.code}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCountryClick(country)}
            >
              <CardBody>
                <div className="flex items-start">
                  <div className="text-4xl mr-4">{country.flag}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {country.name}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {country.visaTypes.length} visa type
                      {country.visaTypes.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {selectedCountry && !selectedVisa && (
        <div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-5xl mr-4">{selectedCountry.flag}</span>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {selectedCountry.name}
                </h2>
                <p className="text-[var(--muted-foreground)]">
                  {selectedCountry.visaTypes.length} visa types available
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {selectedCountry.visaTypes.map((visa) => (
              <Card
                key={visa.code}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVisaClick(visa)}
              >
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {visa.name}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Code: {visa.code}
                  </p>
                </CardHeader>
                <CardBody>
                  <p className="text-sm text-[var(--foreground)] mb-4">
                    {visa.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {visa.minSalary && (
                      <div className="flex items-center text-[var(--muted-foreground)]">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Min. Salary: {visa.currency} {visa.minSalary.toLocaleString()}
                      </div>
                    )}
                    <div className="flex items-center text-[var(--muted-foreground)]">
                      <Clock className="w-4 h-4 mr-2" />
                      Processing: {visa.processingTime}
                    </div>
                    <div className="flex items-center text-[var(--muted-foreground)]">
                      <Calendar className="w-4 h-4 mr-2" />
                      Validity: {visa.validityPeriod}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedVisa && selectedCountry && (
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    {selectedVisa.name}
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {selectedCountry.flag} {selectedCountry.name} • Code: {selectedVisa.code}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                    Description
                  </h3>
                  <p className="text-[var(--foreground)]">{selectedVisa.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVisa.minSalary && (
                    <div className="flex items-start">
                      <DollarSign className="w-5 h-5 text-[var(--primary)] mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          Minimum Salary
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {selectedVisa.currency} {selectedVisa.minSalary.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-[var(--primary)] mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Processing Time
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedVisa.processingTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-[var(--primary)] mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        Validity Period
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {selectedVisa.validityPeriod}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedVisa.requiredDocuments && selectedVisa.requiredDocuments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                      Required Documents
                    </h3>
                    <div className="space-y-3">
                      {selectedVisa.requiredDocuments.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 rounded-lg border border-[var(--border)]"
                        >
                          <FileText className="w-5 h-5 text-[var(--primary)] mr-3 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-[var(--foreground)]">
                                {doc.displayName}
                              </p>
                              {doc.required && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)] mt-1">
                              {doc.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
