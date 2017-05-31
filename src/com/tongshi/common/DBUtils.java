package com.tongshi.common;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Properties;

import sun.tools.jar.resources.jar;

import com.sun.org.apache.commons.digester.rss.Item;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public class DBUtils {
	private static String driverName = "com.mysql.jdbc.Driver";
	private static String urlName;  //  tsuser
	private static String userName ;   // tongshi
	private static String password ; // 123
    private static String dir;
	static {
		String filename = "jdbc.properties";  
		Properties props = new Properties();  
		try {
			props.load(DBUtils.class.getClassLoader().getResourceAsStream(filename));
			urlName  =  props.getProperty("url");
			userName =  props.getProperty("user");
			password =  props.getProperty("password");
        } catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}  
		
		filename = "config.properties";  
		props = new Properties();  
		try {
			props.load(DBUtils.class.getClassLoader().getResourceAsStream(filename));
			dir = props.getProperty("dir");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
	}
	
	public static String getDriverName() {
		return driverName;
	}

	public static String getUrlName() {
		return urlName;
	}

	public static String getUserName() {
		return userName;
	}

	public static String getPassword() {
		return password;
	}
	
	/**
	 * ��ȡ��ݿ����ӣ�Ŀǰ����JDBC�ķ�ʽȡ��
	 * @return
	 */
	public synchronized static Connection getConnection()
	{
		Connection connection = null;
		try
		{
			Class.forName(driverName);
			connection = DriverManager.getConnection(urlName, userName, password);
			
//			System.out.println("connect database ok!");
		}
		catch (Exception e)
		{
//			System.out.println("connect database failed!");
		}
		
		return connection;
	}
	
	/**
	 * �ر�����
	 */
	public static void closeConnection(Connection connection)
	{
		try
		{
			if (connection != null && !connection.isClosed())
			{
				connection.close();
				connection = null;
			}
		}
		catch (SQLException e)
		{
			e.printStackTrace();
		}
	}
	
	/*
	 *  ��ȡ��ݿ����������
	 *  @return ������ݵ�json
	 */
	public static String SelectChannelInfo()
	{
		String result;
		//result = "{\n\"users\":[\n";
		Connection con=null;
		Statement sql;
		ResultSet rs;
		JSONObject json = new JSONObject();
		JSONArray category = new JSONArray();
		try {
			con = getConnection();
			sql = con.createStatement();
			rs = sql.executeQuery("SELECT id,channel_id,channel_name,active,rtmp_url FROM channel");
			while(rs.next()){
				
				if(rs.getInt(4) == 1)
				{
					JSONObject item = new JSONObject();
					item.put("channel_id", rs.getString(2));
					
					if(rs.getString(3)==null)
						item.put("channel_name", rs.getString(2));
					else 
						item.put("channel_name", rs.getString(3));
					
					item.put("rtmp_url", rs.getString(5));
					
					category.add(item);
					//System.out.println( rs.getString(1) + "   "  + rs.getString(2) + "  "  +rs.getString(3)); 
				}
				
				
//				flag = 1;
//				System.out.println(rs.getString(1)+"  "+rs.getString(2));
//				result += "{\"username\":\"" + rs.getString(2) +"\",\"password\":\""+ rs.getString(3) +"\"" + ",\"total\":\""+rs.getString(4)+"\"},\n";
			}
			
			
		} catch (SQLException e) {
			// TODO: handle exception
			e.printStackTrace();
		}finally
		{
			closeConnection(con);
		}
		
		json.put("category", category);
		
		return json.toString();
	}
	
	/*
		 *  ��ȡ��ݿ����������
		 *  @return ������ݵ�json
		 */
		public static String SelectChannelInfoAdmin()
		{
			String result;
			
			//result = "{\n\"users\":[\n";
			
			Connection con=null;
			Statement sql;
			ResultSet rs;
			
			JSONObject json = new JSONObject();
					
			JSONArray category = new JSONArray();
			JSONArray select = new JSONArray();
			
			try {
				
				con = getConnection();
				sql = con.createStatement();
				rs = sql.executeQuery("SELECT id,channel_id,channel_name,active,rtmp_url,start,client_ip FROM channel");
	//			int flag = 0;
				while(rs.next()){
					
					if(rs.getInt(4) == 1)
					{
						JSONObject item = new JSONObject();
						item.put("channel_id", rs.getString(2));
						
						if(rs.getString(3)==null)
							item.put("channel_name", rs.getString(2));
						else 
							item.put("channel_name", rs.getString(3));
						
						item.put("rtmp_url",rs.getString(5));
						item.put("client_ip", rs.getString(7)!=null?rs.getString(7):"");
						item.put("st", rs.getInt(6));
						category.add(item);
						//System.out.println( rs.getString(1) + "   "  + rs.getString(2) + "  "  +rs.getString(3)); 
					}else 
					{
						JSONObject item = new JSONObject();
						item.put("channel_id", rs.getString(2));
						item.put("channel_name", rs.getString(3));
						
						select.add(item);
					}
				}
				sql = con.createStatement();
				rs = sql.executeQuery("SELECT id,channel_id,channel_name,active,rtmp_url FROM channel");
			} catch (SQLException e) {
				// TODO: handle exception
				e.printStackTrace();
			}finally
			{
				closeConnection(con);
			}
			json.put("category", category);
			json.put("sel", select);

			return json.toString();
		}

	public static String SelectChannel(String channel, int day)
	{
		if(day<0 || day >7)return null;
		String result;
		Calendar c = Calendar.getInstance();
		Date date = new Date();
		c.setTime(date); 
		
		int temp= c.get(Calendar.DATE); 
		
		c.set(Calendar.DATE, temp - day);  
		
		date = c.getTime();
		
		SimpleDateFormat bartDateFormat = new SimpleDateFormat("yyyy-MM-dd");
		Connection con=null;
		Statement sql;
		ResultSet rs;

		JSONObject json = new JSONObject();
		json.put("channel_id", channel);
		json.put("date", bartDateFormat.format(date));
		JSONArray category = new JSONArray();
		
		try {
			
			con = getConnection();
			sql = con.createStatement();
			rs = sql.executeQuery("SELECT event_id,channel_id,start_time,end_time,url,finished,title FROM program where channel_id='"+ channel
									+ "' and TO_DAYS(start_time) = TO_DAYS(NOW()) - " + day + " order by start_time");
			while(rs.next()){
				JSONObject item = new JSONObject();
				item.put("start_time", rs.getString(3));
				item.put("end_time", rs.getString(4));
				if(rs.getString(5) != null)
				{
					String url_temp =  rs.getString(5);
					url_temp = url_temp.replace("\r", "");
					url_temp = url_temp.replace("\n", "");
					item.put("url", url_temp);
				}
				else
				    item.put("url", "");
				
				if("1".equals(rs.getString(6)))
					item.put("finished","1");
				else
				    item.put("finished","0");
				
				item.put("title", rs.getString(7));
				category.add(item);
			}
		} catch (SQLException e) {
			// TODO: handle exception
			e.printStackTrace();
		}finally
		{
			closeConnection(con);
		}
		
		json.put("list", category);
		
		return json.toString();
	}
	
	
	public static String AddChannel(String id,String name,String url, String ip)
	{
		String result = "Invalid Request";
				
		Connection con=null;
		Statement sql;
		ResultSet rs;
		
		int flag = 0;
		try {
			//String sqlString = "select count() from user where user='"+username+"';";
			con = getConnection();
			sql = con.createStatement();
			rs = sql.executeQuery("select * from channel where channel_id='"+id+"' and active=0 ;");
			if(rs.next()){
	//			System.out.println(rs.getString(1)+"  "+rs.getString(2));
				//System.out.println("exist");
				flag = 1;
				//System.out.println("exist");
				//return  result;
			}
		} catch (Exception e) {
			e.printStackTrace();
			// TODO: handle exception
			result = "Invalid Request";
		}finally
		{
			closeConnection(con);
		}
		
		if(flag == 1)
		{
			String sqlString = "update channel set channel_name=\""+name+"\",rtmp_url='"+url+"' ,client_ip='"+ ip  +"',active=1 where channel_id=\"" +id+"\"";
			//System.out.println(sqlString);
			try {
				con = getConnection();
				sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
				sql.executeUpdate(sqlString);
				result = "Operate successed";
				
			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				result = "Invalid Request";
			}finally
			{
				closeConnection(con);
			}
		}
		return result;
		
	}
	
	
	public static String InsertChannel(String id,String name,String url, String ip)
	{
		
		String result = "Invalid Request";
		
		Connection con=null;
		Statement sql;
		ResultSet rs;

		try {
			//String sqlString = "select count() from user where user='"+username+"';";
			con = getConnection();
			sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
			String sqlString = "insert into channel (channel_id,channel_name,rtmp_url,client_ip,active) values ('"+id+"','"+name+"','"+url+"','"+ip+"',1);";
			sql.executeUpdate(sqlString);
			result = "Operate successed";
		} catch (Exception e) {
			e.printStackTrace();
			// TODO: handle exception
			result = "Invalid Request";
		}finally
		{
			closeConnection(con);
		}
		
		return result;
		
		
		
		
	}
	
	public static String DeleteChannel(String channel)
	{
		String result = "Invalid Request";
		
		
//		String sqlString = "update channel set rtmp_url='',active=0,client_ip='' where channel_id=\"" +channel+"\"";
		String sqlString = "delete from channel  where channel_id=\"" +channel+"\"";

		Connection con=null;
		Statement sql;
		ResultSet rs;

        result = executeSQL(sqlString);
		FileUtils.DeleteDir(dir + channel);
		
		return result;
		
	}
	
	
	public static String EditChannel(String channel_id,String channel_name,String rtmp_url ,String ip)
	{
		String result = "Invalid Request";
		
		
		String sqlString = "update channel set rtmp_url='"+ rtmp_url+"',channel_name=\""+channel_name +"\",client_ip='" + ip + "' where channel_id=\"" +channel_id+"\"";
		System.out.println(sqlString);
		
		Connection con=null;
		Statement sql;
		ResultSet rs;

        result = executeSQL(sqlString);
		return result;
	}
	
	
	public static void InsertProgram(String channel_id)
	{
		Statement sql;
		ResultSet rs;
		
		// delete old
		String sqlString = "delete from program where channel_id=\"" +channel_id+"\" and finished=0;";
        executeSQL(sqlString);

        // insert new
		Date currentTime = new Date();
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String dateString = formatter.format(currentTime);
		sqlString = "insert into program (channel_id,start_time,finished,title) values ('"+channel_id+"','"+dateString+"',0,'会议');";
        executeSQL(sqlString);
    }

    private static String executeSQL(String sqlString) {
        Statement sql;
        Connection con = null;
        String result;
        try {
            con = getConnection();
            sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
            sql.executeUpdate(sqlString);
            result = "Operate successed";
        } catch (Exception e) {
            // TODO: handle exception
            e.printStackTrace();
            result = "Invalid Request";
        }finally
        {
            closeConnection(con);
        }
        return result;
    }


    public static String BatchDelete()
	{
		String res = null;
		
		int day = 8;
		
		Calendar c = Calendar.getInstance();  
		
		Date date = new Date();
		c.setTime(date); 
		
		int temp= c.get(Calendar.DATE); 
		
		System.out.println("date: "+ temp);
		
		c.set(Calendar.DATE, temp - day); 
		
		temp= c.get(Calendar.DATE); 
		
		System.out.println("date: "+ temp);
			
		
		return res;
	}
	
	
	public static void SetStart(String channel_id, int start){
		String sqlString = "update channel set start="+ start+" where channel_id=\"" +channel_id+"\"";
		Connection con=null;
		Statement sql;
		ResultSet rs;
		try {
			con = getConnection();
			sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
			sql.executeUpdate(sqlString);
			
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();

		}finally
		{
			closeConnection(con);
		}
	
		
	}
	
	public static String GetUrl(String channel_id)
	{
		String res = null;
		
		Connection con=null;
		Statement sql;
		ResultSet rs;
			
		try {
			
			con = getConnection();
			sql = con.createStatement();
			rs = sql.executeQuery("SELECT rtmp_url FROM channel where channel_id='"+channel_id+"';");	
			
//			int flag = 0;
			while(rs.next()){
				
				res = rs.getString(1);	
				
			}
					
		} catch (SQLException e) {
			// TODO: handle exception
			e.printStackTrace();
		}finally
		{
			closeConnection(con);
		}
		
		
		
		return res;	
	}
	
	public static String GetInfo(String channel_id, String col)
	{
		String res = null;
		
		Connection con=null;
		Statement sql;
		ResultSet rs;
		
		
		try {
			
			con = getConnection();
			sql = con.createStatement();
			rs = sql.executeQuery("SELECT " + col +" FROM channel where channel_id='"+channel_id+"';");	
			
//			int flag = 0;
			while(rs.next()){
				
				res = rs.getString(1);	
				
			}
			
			
		} catch (SQLException e) {
			// TODO: handle exception
			e.printStackTrace();
		}finally
		{
			closeConnection(con);
		}
			
		
		return res;
		
	}
	
	
	public static String UpdateMeet(String channel_id, String name)
	{
		String result = "Invalid Request";
		
		Connection con=null;
		Statement sql;
		ResultSet rs;
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		
	 	String sqlString = "update program set title='"+ name+"' where channel_id=\"" +channel_id+"\" and finished=0;" ;
			
		
		try {
			con = getConnection();
			sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
			sql.executeUpdate(sqlString);
			
			
			result = "Operate successed";
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();

		}finally
		{
			closeConnection(con);
		}
		
		return result;
		
	}
	
	public static void ClearChannel()
	{

		
		Connection con=null;
		Statement sql;
		ResultSet rs;

		String sqlString = "update channel set start=0 where active=1;";
		
		//System.out.println(sqlString);
		try {
			
			con = getConnection();
			sql = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE,ResultSet.CONCUR_READ_ONLY);
			sql.executeUpdate(sqlString);
			
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();	
		}finally
		{
			closeConnection(con);
		}
			
		
				
	}
	
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub


		
//		System.out.println(EditChannel("AHTV1", "安徽电视","sdfsdfwefe","fsdsadf"));
		
//		System.out.println(InsertChannel("AHTV1", "安徽", "rtmp://1.8.23.98/live/stream3","1.8.23.96"));

		
//		SetStart("AHTV1", 2);
//		System.out.println(GetInfo("AHTV1","rtmp_url"));
		
		InsertProgram("CCTV1");
		
//UpdateMeet("CCTV1", "安");
//BatchDelete();
		
	}

}
