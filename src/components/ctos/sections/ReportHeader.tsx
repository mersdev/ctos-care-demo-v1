import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon,
  IdentificationIcon,
  CalendarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { PersonalInfo } from "../../../types/ctos";

interface ReportHeaderProps {
  personalInfo: PersonalInfo;
  isVerified: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  personalInfo,
  isVerified,
}) => {
  const personalDetails = [
    {
      icon: <UserCircleIcon className="h-5 w-5" />,
      label: "Full Name",
      value: personalInfo.name,
    },
    {
      icon: <IdentificationIcon className="h-5 w-5" />,
      label: "IC Number",
      value: personalInfo.icNo,
    },
    {
      icon: <CalendarIcon className="h-5 w-5" />,
      label: "Date of Birth",
      value: personalInfo.dateOfBirth,
    },
  ];

  return (
    <div className="relative">
      {/* Header with Verification Badge */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">CTOS Report</h1>
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center">
          {isVerified ? (
            <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 shadow-sm">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Verified Report</span>
            </div>
          ) : (
            <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-200 shadow-sm">
              <XCircleIcon className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Unverified Report</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information Cards */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800">
            Personal Information
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Details */}
          {personalDetails.map((detail, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 group"
            >
              <div className="flex items-start space-x-3 mb-2">
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200 mt-0.5">
                  {detail.icon}
                </div>
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    {detail.label}
                  </dt>
                  <dd className="text-base font-semibold text-gray-900 break-words">
                    {detail.value}
                  </dd>
                </div>
              </div>
            </div>
          ))}

          {/* Address Section - Spans Full Width */}
          <div className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:bg-gray-100 group md:col-span-3">
            <div className="flex items-start space-x-3">
              <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200 mt-0.5">
                <HomeIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                  Address
                </dt>
                <dd className="text-base font-semibold text-gray-900 break-words">
                  {personalInfo.address}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
