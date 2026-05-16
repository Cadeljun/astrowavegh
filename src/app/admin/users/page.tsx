'use client'

import { Button } from "@/components/ui/Button";

export default function UserManagementPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">USER MANAGEMENT</h1>
                    <p className="text-muted">Manage team access and roles</p>
                </div>
                <Button>ADD USER</Button>
            </div>
        </div>
    )
}