"use client"

import { useState, useEffect } from "react"

interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  position: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

export function useEmployee() {
  const [employee, setEmployee] = useState<Employee>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
    position: '',
    isActive: true,
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return employee
} 