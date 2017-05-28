package com.tongshi.common;

import java.io.File;

public class FileUtils {

	public static void DeleteDir(String path)
	{
		File file = new File(path);
		
		if(file.exists()){
			deleteFile(file);
		}
		
	}
	
	
	private static void deleteFile(File file){
	
		if(file.isDirectory()){
			
			File[] files = file.listFiles();
	        for(int i=0; i<files.length; i++){
	              deleteFile(files[i]);
	        }
		}
        file.delete();
	
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
//		DeleteDir("d:\\test");
	}

}
