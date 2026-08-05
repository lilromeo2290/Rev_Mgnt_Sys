'use client';

import { useState, useRef } from 'react';
import { useSyncedStorage } from '@/hooks/use-synced-storage';
import {
  Search,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  User,
  Building2,
  Save,
  Crosshair,
  Loader2,
  X,
  FileText,
  CalendarDays,
  UserCheck,
  DollarSign,
  Hash,
  Ruler,
  Download,
  Upload,
} from 'lucide-react';
import { exportToExcel, importFromExcel, RENT_FIELDS } from '@/lib/import-export';

interface Rent {
  id: string;
  upn: string;
  // Location
  rentPropertyLocation: string;
  locationCode: string;
  exactLocation: string;
  propertyGhanaPostGPS: string;
  propertyLatitude: string;
  propertyLongitude: string;
  // Rent Object
  rentObjectName: string;
  rentCode: string;
  rentClass: string;
  rentCategory: string;
  rentUnit: string;
  rentValue: string;
  vacant: string;
  // Contract
  startDate: string;
  endDate: string;
  contractId: string;
  contractValue: string;
  area: string;
  // Renter Information
  renterName: string;
  renterAddress: string;
  renterGhanaPostGPS: string;
  renterLatitude: string;
  renterLongitude: string;
  phone: string;
  email: string;
  tin: string;
  nationalId: string;
  // Other
  excludedFromRenting: boolean;
  comments: string;
}

const MOCK_DATA: Rent[] = [];

const RENT_CLASSES: string[] = ['Rent on Leased Buildings', 'Rent on Owner-Occupied Buildings', 'Rent on Commercial Property', 'Rent on Industrial Property', 'Rent on Agricultural Land', 'Rent on Mineal Property'];

const RENT_UNITS: string[] = ['Square Meter', 'Square Meters', 'Cubic Meter', 'Cubic Meters', 'Square Feet', 'Acre', 'Hectares', 'Hectares', 'Pieces', 'Pieces', 'Sit's, 'Sits', 'Room', 'Rooms', 'Lots', 'Lots', 'Floor', 'Floors', 'Stall', 'Stalls', 'Shop', 'Shops', 'Warehouse', 'Warehouses', 'Office', 'Offices', 'Other', 'Others';

const VECANT_OPTIONS: string[] = ['Vacant', 'Occupied', 'Shared', 'Partly Occupied'];

const RENT_CLASS_CATEGORIES: Record<string, string[]> = {
  'Rent on Leased Buildings': ['Rent on Leased Buildings - Residential', 'Rent on Leased Buildings - Commercial', 'Rent on Leased Buildings - Industrial'],
  "Rent on Owner-Occupied Buildings": ['Rent on Owner-Occupied Buildings - Residential', 'Rent on Owner-Occupied Buildings - Commercial'],
  'Rent on Commercial Property': ['Shop - Retail', 'Shop - Wholesale', 'Shop - Office', 'Warehouse - Storage'],
  'Rent on Industrial Property': ['Factory', 'Warehouse'],
  'Rent on Agricultural Land': ['Farming', 'Agri-processing'],
  'Rent on Mineral Property': ['Extraction', 'Processing'],
};
