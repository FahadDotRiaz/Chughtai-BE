export function generateRandomNumber(length: number) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// response-helper.ts
import { ApiResponseDto } from './response.dto';

export function createSuccessResponse<T>(
  status: number,
  message: string,
  data?: T,
): ApiResponseDto<T> {
  return {
    status,
    message,
    success: true,
    data: removeCircularReferences(data),
  };
}
export function createErrorResponse<T>(
  status: number,
  message: string,
  error?: T,
): ApiResponseDto<T> {
  return { success: false, message: message, status: status, error: error };
}

export function removeCircularReferences(obj: any, seen = new Set()): any {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return '[Circular Reference]';
    }
    seen.add(obj);
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        obj[index] = removeCircularReferences(item, seen);
      });
    } else {
      Object.keys(obj).forEach((key) => {
        obj[key] = removeCircularReferences(obj[key], seen);
      });
    }
  }
  return obj;
}

export function generateFormatDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}
export function generateTimeFormat() {
  const currentDate = new Date();
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const seconds = String(currentDate.getSeconds()).padStart(2, '0');

  const formattedDateTime = `${hours}:${minutes}:${seconds}`;
  return formattedDateTime;
}

export function generateUserResponse(secondObject: any) {
  const firstRoles = secondObject?.roles.map((role) => ({
    roleId: role.id,
    roleName: role.name,
    departmentId: role.department.id,
    departName: role.department.name,
    departmentType: role.department.type,
    locationId: role.department.location.id,
    locationName: role.department.location.name,
    permissions: role.actions.reduce((permissions, action) => {
      permissions[action.menu.menuKey] = {
        [action.actionKey]: true,
      };
      return permissions;
    }, {}),
  }));
  if (firstRoles) {
    return {
      id: secondObject?.id,
      username: secondObject?.username,
      email: secondObject?.email,
      file: secondObject?.file,
      roles: firstRoles,
      isSuperAdmin: secondObject?.isSuperAdmin,
    };
  }
  return {
    id: secondObject?.id,
    username: secondObject?.username,
    email: secondObject?.email,
    cnic: secondObject?.cnic,
    file: secondObject?.file,
    roles: [],
  };
}

export function convertTZ(date): any {
  const options = {
    timeZone: 'Asia/Karachi',
    hour12: false,
  };

  let formattedDate = date.toLocaleString('en-US', options);
  const [datePart, timePart] = formattedDate.split(', ');
  formattedDate = `${datePart.replaceAll('/', '-')}, ${timePart}`;
  if (timePart === '24:00:00') {
    formattedDate = `${datePart.replaceAll('/', '-')}, 00:00:00`;
  }

  return formattedDate;
}
