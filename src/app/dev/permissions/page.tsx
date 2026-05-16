'use client'

import { Check, X } from "lucide-react";

const permissions = [
    { feature: 'Admin Panel', sa: true, ed: false, vi: false, de: false },
    { feature: 'Manage Events', sa: true, ed: false, vi: false, de: false },
    { feature: 'Manage Talent', sa: true, ed: false, vi: false, de: false },
    { feature: 'View Contacts', sa: true, ed: false, vi: false, de: false },
    { feature: 'Edit CMS Content', sa: true, ed: true, vi: false, de: false },
    { feature: 'View CMS Content', sa: true, ed: true, vi: true, de: false },
    { feature: 'Dev Panel Access', sa: true, ed: true, vi: true, de: true },
    { feature: 'Component Library', sa: true, ed: false, vi: false, de: true },
    { feature: 'Firebase Tester', sa: true, ed: false, vi: false, de: true },
    { feature: 'Cloudinary Browser', sa: true, ed: false, vi: false, de: true },
    { feature: 'Seed Database', sa: true, ed: false, vi: false, de: false },
    { feature: 'Manage Users', sa: true, ed: false, vi: false, de: false },
];

export default function PermissionsPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-2">Role Permission Matrix</h1>
            <p className="text-muted mb-8">A visual reference for what each role can and cannot do.</p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Feature</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Super Admin</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Editor</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Viewer</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Developer</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                        {permissions.map((permission) => (
                            <tr key={permission.feature}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{permission.feature}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{permission.sa ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{permission.ed ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{permission.vi ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{permission.de ? <Check className="text-green-500 mx-auto" /> : <X className-="text-red-500 mx-auto" />}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}