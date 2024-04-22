package com.lifeplus.Pojo;

import java.util.HashMap;
import java.util.UUID;

public class ServicesDef {

    public static final UUID SERVICE_UUID = UUID.fromString("4C505732-5F43-5553-544F-4D5F53525600");

    private  HashMap<UUID,Object> CustomService = new HashMap<>();

    public HashMap<UUID, Object> getCustomService() {
        return CustomService;
    }

    public void setCustomService(HashMap<UUID, Object> customService) {
        CustomService = customService;
    }
}
