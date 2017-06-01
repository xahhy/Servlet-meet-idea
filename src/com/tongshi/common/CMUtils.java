package com.tongshi.common;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class CMUtils {

	public static String START_PATH ;
	public static String KILL_PATH ;
	public static String PORT ;
	
	static {
		String filename = "config.properties";  
		Properties props = new Properties();  
		try {
			props.load(CMUtils.class.getClassLoader().getResourceAsStream(filename));
			START_PATH  =  props.getProperty("start_path");
			KILL_PATH = props.getProperty("kill_path");
			PORT = props.getProperty("port");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}  
	}
	
	public static String StartChannel(String channel_id)
	{
		String res = "Invalid Request";
		DBUtils.SetStart(channel_id, 2);
		String rtmp_url = DBUtils.GetUrl(channel_id);
		if(rtmp_url == null)
		{
			DBUtils.SetStart(channel_id, 0);
			return res;
		}
		
		// insert program
		DBUtils.InsertProgram(channel_id);
		
		// start cmd
		
		//for linux
		BufferedReader reader=null;  
		
		String cmd = START_PATH + " 0 "+ channel_id + " 1>/dev/null 2>&1 &";// pass  
      try {      	      	  
          Process process = Runtime.getRuntime().exec(cmd);          
          //reader=new BufferedReader(new InputStreamReader(process.getInputStream()));  
//          String line=null;  
//          while((line=reader.readLine())!=null){  
//              System.out.println(line); 
//              
//              if("success".equals(line)) res = "Operate successed" ;
//          }   
         
//          System.out.println("START_PATH:"+ cmd +" called");                  
//          process.waitFor();
          res = "Operate successed" ;

          //System.out.println(ps.getOutputStream().toString()); 
      } catch (IOException ioe) {  
          ioe.printStackTrace();  
          res = "Invalid Request";
      } 
		
		return res;
	}
	
	public static String StopChannel(String channel_id)
	{
		String res = "Invalid Request";		
		//for linux
		 BufferedReader reader=null;  	 		
	  String cmd = KILL_PATH + " 1 " + channel_id +" 1>/dev/null 2>&1 &";// pass  		 
		 
      try {  
          Process process = Runtime.getRuntime().exec(cmd);

          
//          reader=new BufferedReader(new InputStreamReader(process.getInputStream()));  
//          String line=null;  
//          while((line=reader.readLine())!=null){         
//              if("success".equals(line)) res = "Operate successed" ;
//          }  
          process.waitFor();
          
         res = "Operate successed" ;
          
//         System.out.println("KILL_PATH:"+ cmd +" called");
      } catch (IOException ioe) {  
          ioe.printStackTrace();  
          res = "Invalid Request";
      } catch (InterruptedException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
		res = "Invalid Request";
	} 
      
		//res = "Operate successed";
      	
        //System.out.println("child thread donn");  
      	DBUtils.SetStart(channel_id, 0);
      			
		return res;
	}
	
	
	public static String StartChannelRemote(String channal_id, String ip)
	{
		String result = "";
		
		String url = "http://"+ getIP(ip) + ":"+ PORT + "/replay-client/am?op=start&c="+ channal_id;
		BufferedReader in = null;
		
		try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
//            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 建立实际的连接
            connection.connect();
           
            // 定义 BufferedReader输入流来读取URL的响应
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
        } catch (Exception e) {
            System.out.println("发送GET请求出现异常！" + e);
            e.printStackTrace();
        }
        // 使用finally块来关闭输入流
        finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
		System.out.println("http get:" + result);
        return result;
		
	}
	
	
	public static String StopChannelRemote(String channal_id, String ip)
	{
		String result = "";
		
		String url = "http://"+ getIP(ip) + ":"+ PORT + "/replay-client/am?op=kill&c="+ channal_id;
		BufferedReader in = null;
		
		try {
            URL realUrl = new URL(url);
            // 打开和URL之间的连接
            URLConnection connection = realUrl.openConnection();
            // 设置通用的请求属性
            connection.setRequestProperty("accept", "*/*");
//            connection.setRequestProperty("connection", "Keep-Alive");
            connection.setRequestProperty("user-agent",
                    "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1;SV1)");
            // 建立实际的连接
            connection.connect();
           
            // 定义 BufferedReader输入流来读取URL的响应
            in = new BufferedReader(new InputStreamReader(
                    connection.getInputStream()));
            String line;
            while ((line = in.readLine()) != null) {
                result += line;
            }
        } catch (Exception e) {
            System.out.println("发送GET请求出现异常！" + e);
            e.printStackTrace();
        }
        // 使用finally块来关闭输入流
        finally {
            try {
                if (in != null) {
                    in.close();
                }
            } catch (Exception e2) {
                e2.printStackTrace();
            }
        }
		System.out.println("http get:" + result);
        return result;
		
	}
	
	private static String getIP(String ip)
	{
		
		if(ip.contains(":"))
		{
			return ip.substring(0, ip.indexOf(':'));
		}else return ip;
		
		
	}
	
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub

		//System.out.println(START_PATH + KILL_PATH);
		
		//StartChannel("");
		
		//System.out.println(getIP("1.8.23.96:10000"));
		
	}

}
