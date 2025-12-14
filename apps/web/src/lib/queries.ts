


export type queriesMap<T> = Record<string,{ label: string;value: T;}>;

export const queryKeys = {
  me: ["me"] as const,
  auth: {
    register: { queryKey: ["auth", "register"] as const },
  },
  fighters: { queryKey: ["fighter"] as const },
  fighterItem: (userId: string) => ({ queryKey: ["fighter", userId] as const }),
  teams: {
    queryKey: ["team"] as const
  },
  teamItem: (userId: string) => ({ queryKey: ["team", userId] as const }) as const,
  attendance: (startDate: Date, endDate: Date) => ({ queryKey: ["attendance", startDate, endDate] as const }),
  attendanceItem: (id: string) => ({ queryKey: ["attendance", id] as const }),
  gearCatalog: { queryKey: ["gear-catalog"] as const },
  serializedGear: { queryKey: ["serialized-gear"] as const },
  serializedGearItem: (id: string) => ({ queryKey: ["serialized-gear", id] as const }),
};
