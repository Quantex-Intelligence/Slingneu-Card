import axios from "axios";
import { baseUrl } from "./Constants";

import { router } from "expo-router";
export default {
  call: async function (
    url: string,
    method: string = "POST",
    bodyData: any = null,
    token: any = ""
  ): Promise<any> {
    const fullUrl: string = baseUrl + url;

    let headers: Record<string, string> = {
      "Content-Type":"application/json",
    };

    headers["Accept"] = "application/json";

    if (bodyData instanceof FormData) {
      delete headers["Content-Type"];
    }

    if(token){
      headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("fullUrl",fullUrl)
    try {
      const config = {
        method,
        url: fullUrl,
        headers,
        data: method !== "GET" ? bodyData : undefined,
        withCredentials: true,
      };

      const response = await axios(config);
      if (response.status === 401) {
        router.replace("/session-expired");
        return { status: 401, data: null };
      }
      if (response.status >= 200 && response.status < 300) {
        return { status: response.status, data: response.data };
      }
      return { status: response.status, data: response.data };
    } catch (error: any) {
      return { 
        status: error.response?.status || 500, 
        data: error.response?.data,
        error 
      };
    }
  },
};
