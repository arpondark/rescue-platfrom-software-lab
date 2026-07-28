"use client";
import { useEffect, useState } from "react";
import { api } from "./api";
import type { Location } from "./types";

export function useDivisions() {
  const [data, setData] = useState<Location[]>([]);
  useEffect(() => { api<Location[]>("/api/v1/locations/divisions").then(setData).catch(() => {}); }, []);
  return data;
}
export function useDistricts(divisionId: number | null) {
  const [data, setData] = useState<Location[]>([]);
  useEffect(() => {
    if (!divisionId) { setData([]); return; }
    api<Location[]>(`/api/v1/locations/districts?divisionId=${divisionId}`).then(setData).catch(() => {});
  }, [divisionId]);
  return data;
}
export function useThanas(districtId: number | null) {
  const [data, setData] = useState<Location[]>([]);
  useEffect(() => {
    if (!districtId) { setData([]); return; }
    api<Location[]>(`/api/v1/locations/thanas?districtId=${districtId}`).then(setData).catch(() => {});
  }, [districtId]);
  return data;
}