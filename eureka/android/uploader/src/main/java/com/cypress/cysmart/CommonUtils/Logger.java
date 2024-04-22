/*
 * (c) 2014-2020, Cypress Semiconductor Corporation or a subsidiary of 
 * Cypress Semiconductor Corporation.  All rights reserved.
 * 
 * This software, including source code, documentation and related 
 * materials ("Software"),  is owned by Cypress Semiconductor Corporation 
 * or one of its subsidiaries ("Cypress") and is protected by and subject to 
 * worldwide patent protection (United States and foreign), 
 * United States copyright laws and international treaty provisions.  
 * Therefore, you may use this Software only as provided in the license 
 * agreement accompanying the software package from which you 
 * obtained this Software ("EULA").
 * If no EULA applies, Cypress hereby grants you a personal, non-exclusive, 
 * non-transferable license to copy, modify, and compile the Software 
 * source code solely for use in connection with Cypress's 
 * integrated circuit products.  Any reproduction, modification, translation, 
 * compilation, or representation of this Software except as specified 
 * above is prohibited without the express written permission of Cypress.
 * 
 * Disclaimer: THIS SOFTWARE IS PROVIDED AS-IS, WITH NO WARRANTY OF ANY KIND, 
 * EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, NONINFRINGEMENT, IMPLIED 
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. Cypress 
 * reserves the right to make changes to the Software without notice. Cypress 
 * does not assume any liability arising out of the application or use of the 
 * Software or any product or circuit described in the Software. Cypress does 
 * not authorize its products for use in any products where a malfunction or 
 * failure of the Cypress product may reasonably be expected to result in 
 * significant property damage, injury or death ("High Risk Product"). By 
 * including Cypress's product in a High Risk Product, the manufacturer 
 * of such system or application assumes all risk of such use and in doing 
 * so agrees to indemnify Cypress against all liability.
 */

package com.cypress.cysmart.CommonUtils;


import android.util.Log;

/**
 * This is a custom log class that will manage logs in the project. Using the
 * <b>disableLog()</b> all the logs can be disabled in the project during the
 * production stage <b> enableLog()</b> will allow to enable the logs , by
 * default the logs will be visible.<br>
 * *
 */
public class Logger {

    public static final String DATA_LOGGER_FILE_EXTENSION = ".txt";
    private static String mLogTag = "CySmart Android";
    private static boolean mLogflag = true;
    private static java.io.File mDataLoggerDirectory;
    private static java.io.File mDataLoggerFile;
    private static android.content.Context mContext;

    public static void d(String message) {
        show(Log.DEBUG, mLogTag, message);

    }

    public static void d(String tag, String message) {
        show(Log.DEBUG, tag, message);

    }

    public static void w(String message) {
        show(Log.WARN, mLogTag, message);

    }

    public static void i(String message) {
        show(Log.INFO, mLogTag, message);

    }

    public static void e(String message) {
        show(Log.ERROR, mLogTag, message);

    }

    public static void v(String message) {
        show(Log.VERBOSE, mLogTag, message);

    }

    public static void dataLog(String message) {
        Log.i("cySmart", message);
        // showToast(Log.INFO, mLogTag, message);
        //saveLogData(message);

    }

    /**
     * print log for info/error/debug/warn/verbose
     *
     * @param type : <br>
     *             Log.INFO <br>
     *             Log.ERROR <br>
     *             Log.DEBUG <br>
     *             Log.WARN <br>
     *             Log.VERBOSE Log.
     */
    private static void show(int type, String tag, String msg) {

        if (msg.length() > 4000) {
            Log.i("Length ", msg.length() + "");

            while (msg.length() > 4000) {
                show(type, tag, msg.substring(0, 4000));
                msg = msg.substring(4000, msg.length());

            }
        }
        if (mLogflag)
            switch (type) {
                case Log.INFO:
                    Log.i(tag, msg);
                    break;
                case Log.ERROR:
                    Log.e(tag, msg);
                    break;
                case Log.DEBUG:
                    Log.d(tag, msg);
                    break;
                case Log.WARN:
                    Log.w(tag, msg);
                    break;
                case Log.VERBOSE:
                    Log.v(tag, msg);
                    break;
                case Log.ASSERT:
                    Log.wtf(tag, msg);
                    break;
                default:
                    break;
            }

    }

    public static void createDataLoggerFile(android.content.Context context) {
        mContext = context;
        try {
            mDataLoggerDirectory = new java.io.File(android.os.Environment.getExternalStorageDirectory() + java.io.File.separator + "CySmart");
            if (!mDataLoggerDirectory.exists()) {
                mDataLoggerDirectory.mkdirs();
            }

            mDataLoggerFile = new java.io.File(mDataLoggerDirectory.getAbsoluteFile() + java.io.File.separator + Utils.GetDate() + DATA_LOGGER_FILE_EXTENSION);
            if (!mDataLoggerFile.exists()) {
                mDataLoggerFile.createNewFile();
            }

            deleteOldFiles();
        } catch (java.io.IOException e) {
            e.printStackTrace();
        }
    }

    public static void deleteOldFiles() {
        java.io.File[] files = mDataLoggerDirectory.listFiles(new java.io.FilenameFilter() {
            @Override
            public boolean accept(java.io.File dir, String name) {
                return name.toLowerCase().endsWith(DATA_LOGGER_FILE_EXTENSION)
                        && !name.equals(mDataLoggerFile.getName()); // Skip current file
            }
        });
        if (files != null && files.length > 0) { // Can be null on Android M and above if Storage permission is not granted
            java.util.Map<Long, java.io.File> fileMap = new java.util.TreeMap<>(new java.util.Comparator<Long>() { // Sort in descending order: from newest to oldest
                @Override
                public int compare(Long arg0, Long arg1) {
                    return arg0 > arg1 ? -1 : arg0 == arg1 ? 0 : 1;
                }
            });
            for (java.io.File file : files) {
                fileMap.put(file.lastModified(), file);
            }
            int count = 0;
            for (java.util.Map.Entry<Long, java.io.File> en : fileMap.entrySet()) {
                if (++count > 6) { // There should be up to 7 file in the history list. 7 = 6 + current file.
                    en.getValue().delete();
                }
            }
        }
    }

    private static void saveLogData(String message) {
        mDataLoggerFile = new java.io.File(mDataLoggerDirectory.getAbsoluteFile() + java.io.File.separator + Utils.GetDate() + DATA_LOGGER_FILE_EXTENSION);
        if (!mDataLoggerFile.exists()) {
            try {
                mDataLoggerFile.createNewFile();
            } catch (java.io.IOException e) {
                e.printStackTrace();
            }
        }
        message = Utils.GetTimeandDate() + message;
        try {
            java.io.OutputStreamWriter writer = new java.io.OutputStreamWriter(
                    new java.io.FileOutputStream(mDataLoggerFile, true),
                    "UTF-8");
            java.io.BufferedWriter fbw = new java.io.BufferedWriter(writer);
            fbw.write(message);
            fbw.newLine();
            fbw.flush();
            fbw.close();
        } catch (java.io.IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
