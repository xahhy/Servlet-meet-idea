package com.tongshi.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.ServletContext;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sun.org.apache.xml.internal.security.utils.HelperNodeList;
import com.tongshi.common.CMUtils;
import com.tongshi.common.DBUtils;
import net.sf.json.JSONObject;

@WebServlet(name = "AdminServlet",
        urlPatterns = {"/am"})
public class AdminServlet extends HttpServlet {

    String OP_FAILED = "Operate failed";
    String OP_SUCCESS = "Operate successed";
    boolean DEBUG = false;
    class myTimerTask extends TimerTask {
        private String id;
        public String start_time="";
        myTimerTask(String id) {
            this.id = id;
        }

        @Override
        public void run() {
            // TODO Auto-generated method stub
            setStatus(id, 0);
//            CMUtils.StopChannel(id);
//            DBUtils.SetStart(id, 0);
            System.out.println("stop channel " + id + " done!");
        }
    }

    class myTimer extends Timer {
        public Date start_date;//Count Down time in seconds
        public myTimerTask task;
    }

    private Map<String, myTimer> m_TimerList;

    /**
     * Constructor of the object.
     */
    public AdminServlet() {
        super();
        m_TimerList = new HashMap<String, myTimer>();
    }

    /**
     * Destruction of the servlet. <br>
     */
    public void destroy() {
        super.destroy(); // Just puts "destroy" string in log
        // Put your code here
    }

    /**
     * The doGet method of the servlet. <br>
     * <p>
     * This method is called when a form has its tag value method equals to get.
     *
     * @param request  the request send by the client to the server
     * @param response the response send by the server to the client
     * @throws ServletException if an error occurred
     * @throws IOException      if an error occurred
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("text/plain;charset=UTF-8;pageEncoding=UTF-8");
        String op = request.getParameter("op");

        String id = request.getParameter("id");
        String name = request.getParameter("name");
        String url = request.getParameter("url");
        String ip = request.getParameter("ip");
        String time = request.getParameter("time");
        String s = request.getParameter("s");
        //System.out.println(feed + "  "  +  list + "  " + d);
        String result = "";
        if (op == null) return;
        if (op.equals("category")) {
            result = DBUtils.SelectChannelInfoAdmin();
        }
        switch (op) {
            case "add":
                name = new String(name.getBytes("iso-8859-1"), "UTF-8");
                //name = java.net.URLDecoder.decode(name, "UTF-8");
                //System.out.println(name);
                result = DBUtils.InsertChannel(id, name, url, ip);
                break;
            case "delete":
                result = DBUtils.DeleteChannel(id);
                break;
            case "edit":
                //name = new String(name.getBytes("iso-8859-1"),"UTF-8");
                System.out.println("name :" + name);
                System.out.println("name byte :" + Arrays.toString(name.getBytes("iso-8859-1")));
                name = new String(name.getBytes("iso-8859-1"), "utf8");
                System.out.println("name :" + name);
                result = DBUtils.EditChannel(id, name, url, ip);
                break;
            case "meet":
                System.out.println("name=" + name);
                name = new String(name.getBytes("iso-8859-1"), "utf8");
                System.out.println("time=" + time);
                DBUtils.UpdateMeet(id, name);
                break;
        }
        if (op.equals("status")) {
            result = OP_SUCCESS;
            switch (s) {
                case "stop":
                    result = setStatus(id, 0);
                    //				    result = CMUtils.StopChannel(id);
//                    DBUtils.SetStart(id, 0);
                    System.out.println("stop channel " + id);
                    break;
                case "start":
                    System.out.println("try to start channel:" + id + " time:" + time + " min");
                    JSONObject rsp = new JSONObject();
                    String start_time = "";
                    if (time.equals("")) {
                        System.out.println("start channel " + id + " time=forever");
                        result = setStatus(id, 1);
//                        result = CMUtils.StartChannel(id);
//                        DBUtils.SetStart(id, 1);
                    } else {
                        try {
                            int countDown = Integer.parseInt(time);
                            if (countDown != 0) {
                                result = setStatus(id, 1);
                                start_time = DBUtils.GetStartTime(id);
                                System.out.println("start channel " + id + " time=" + time + " min "+"start_time= "+start_time);

                                myTimer timer = new myTimer();
                                myTimerTask task = new myTimerTask(id);
                                task.start_time = start_time;
                                timer.task = task;
                                Date stop_date = new Date();
                                timer.start_date = (Date)stop_date.clone();
                                System.out.println("start date: "+stop_date);
                                stop_date.setTime(stop_date.getTime()+countDown*60*1000);
                                System.out.println("stop date: "+stop_date);
                                timer.schedule(task, stop_date);
                                m_TimerList.put(id, timer);
                                DBUtils.SetEndTime(id,stop_date);
                                rsp.put("start_time",start_time);
                            } else {
                                System.out.println("start channel " + id + " forever");
                                result = setStatus(id, 1);
                                myTimer timer = new myTimer();
                                Date start_date = new Date();
                                timer.start_date = (Date)start_date.clone();
                                m_TimerList.put(id, timer);
                                //result = CMUtils.StartChannel(id);
//                                DBUtils.SetStart(id, 1);
                            }
                        } catch (Exception e) {
                            // TODO: handle exception
                        }
                    }
                    rsp.put("result", result);
                    result = rsp.toString();
                    break;
                case "continue":
                    System.out.println("continue operation");
                    result = OP_SUCCESS;
                    System.out.println(DBUtils.GetStartTime(id));
                    if (time.equals("")) {
                        System.out.println("time is Empty!");
                        myTimer timer = m_TimerList.get(id);
                        timer.task.cancel();
                        DBUtils.SetEndTime(id,null);
                        System.out.println("cancel channel " + id + " task");
                        result = "Cancel Ok";
                    }
                    else {
                        try {
                            int countDown = Integer.parseInt(time);
                            myTimer timer = m_TimerList.get(id);
                            System.out.println("continue timer:"+timer);
                            int time_new = Integer.parseInt(time);
                            if (countDown != 0) {
                                System.out.println("channel " + id + " new time is:" + time_new + " min");
                                try {
                                    timer.task.cancel();
                                } catch (Exception e) {
                                    System.out.println(e);
                                }

                                Date stop_date = new Date();
                                Date start_date = new Date();
                                Date now = new Date();
                                start_date = timer.start_date;
                                System.out.println("legal reset date ");
                                System.out.println("start date: "+stop_date);
                                stop_date.setTime(start_date.getTime()+countDown*60*1000);
                                System.out.println("stop date: "+stop_date);
                                if(now.before(stop_date)){
                                    myTimerTask task = new myTimerTask(id);
                                    timer.task = task;
                                    timer.schedule(task, stop_date);
                                    DBUtils.SetEndTime(id,stop_date);
                                    System.out.println("reschedule done");
                                    result = OP_SUCCESS;
                                }else{
                                    System.out.println("end time is earlier than start time");
                                    result = OP_FAILED;
                                }

                            } else {
                                //Just stop timer task for manually stop
                                timer.task.cancel();
                                DBUtils.SetEndTime(id,null);
                                System.out.println("stop timer task in channel " + id);
                                result = "Cancel Ok";
                            }
                        } catch (Exception e) {
                            // TODO: handle exception
                            result = OP_FAILED;
                        }
                    }
                    break;
            }
        }
//        System.out.println("result=" + result);
        PrintWriter out = response.getWriter();
        out.print(result);
        out.flush();
        out.close();
    }

    private String setStatus(String id, int status) {
        String result = OP_SUCCESS;
        if(DEBUG==false){
            if(status == 1){
                result = CMUtils.StartChannel(id);
            } else if (status == 0) {
                result = CMUtils.StopChannel(id);
            }
        }else{
            DBUtils.SetStart(id, status);
        }
        return result;
    }

    /**
     * The doPost method of the servlet. <br>
     * <p>
     * This method is called when a form has its tag value method equals to post.
     *
     * @param request  the request send by the client to the server
     * @param response the response send by the server to the client
     * @throws ServletException if an error occurred
     * @throws IOException      if an error occurred
     */
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
        out.println("<HTML>");
        out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
        out.println("  <BODY>");
        out.print("    This is ");
        out.print(this.getClass());
        out.println(", using the POST method");
        out.println("  </BODY>");
        out.println("</HTML>");
        out.flush();
        out.close();
    }

    /**
     * Initialization of the servlet. <br>
     *
     * @throws ServletException if an error occurs
     */
    public void init() throws ServletException {
        // Put your code here
    }

}
