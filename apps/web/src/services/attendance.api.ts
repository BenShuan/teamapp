import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryKeys } from "@/web/lib/queries";
import { queryOptions } from "@tanstack/react-query";
import { NewAttendance, UpdateAttendance } from "@teamapp/api/schema";

export const attendanceQueryOptions = queryOptions({
  ...queryKeys.attendance,
  queryFn: async () => {
    const response = await apiClient.api.attendance.$get();
    return response.json();
  },
});
// export const createAttendenceForFighterByDates = async (dates: string[], fighterArray: Fighter[]) => {

//   const creates: NewAttendance[] = [];
//   const defaultLocation = (statusLocations && statusLocations.length > 0) ? statusLocations[0] : 'נוכח';
//   fighterArray.forEach((f: any) => {
//     dates.forEach((d) => {
//       // create attendance with default location (undefined)
//       creates.push({
//         fighterId: f.id,
//         workDate: d,
//         location: defaultLocation as any,
//       });
//     });
//   });

//   await createAttendance(creates);
//   // after creating, you may want to invalidate queries — use query client in hook if needed
//   // For now rely on existing hooks to refresh when appropriate
// };
export const createAttendance = async (attendances: NewAttendance[]) => {
  const response = await apiClient.api.attendance.$post({
    json: attendances as any,
  });
  const json = await response.json();
  if ("success" in json) {
    const message = formatApiError(json);
    throw new Error(message);
  }
  return json;
};

export const updateAttendance = async ({
  id,
  attendance: attendanceUpdate,
}: {
  id: string;
  attendance: UpdateAttendance;
}) => {

  const payload = {
    ...attendanceUpdate,
   
  };
  const response = await apiClient.api.attendance[":id"].$patch({
    param: { id },
    json: payload as any,
  });
  if (response.status !== 200) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
};

export const deleteAttendance = async (id: string) => {
  const response = await apiClient.api.attendance[":id"].$delete({
    param: { id },
  });
  if (response.status !== 204) {
    const json = await response.json();
    if ("message" in json) {
      throw new Error(json.message);
    }
    const message = formatApiError(json);
    throw new Error(message);
  }
};
