"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

const COLORS = ["#3e30d9", "#51b206", "#f1f3f7"]

interface RoleEntry {
  name: string
  value: number
}

interface AdminRoleChartProps {
  roleData: RoleEntry[]
  totalStudents: number
  totalMentors: number
}

export default function AdminRoleChart({ roleData, totalStudents, totalMentors }: AdminRoleChartProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roleData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {roleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4 flex flex-col justify-center">
        <div>
          <p className="text-sm text-muted-foreground">Students</p>
          <p className="text-2xl font-bold text-primary">{totalStudents}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Mentors</p>
          <p className="text-2xl font-bold text-secondary">{totalMentors}</p>
        </div>
      </div>
    </div>
  )
}
