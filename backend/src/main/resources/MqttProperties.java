package com.smartharvester.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "mqtt")
public class MqttProperties {

    private String broker;
    private String clientId;
    private String username;
    private String password;
    private int qos = 1;
    private List<String> topics = new ArrayList<>();

    private Ssl ssl = new Ssl();
    private Connection connection = new Connection();

    public String getBroker() {
        return broker;
    }

    public void setBroker(String broker) {
        this.broker = broker;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getQos() {
        return qos;
    }

    public void setQos(int qos) {
        this.qos = qos;
    }

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }

    public Ssl getSsl() {
        return ssl;
    }

    public void setSsl(Ssl ssl) {
        this.ssl = ssl;
    }

    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

    public static class Ssl {
        private boolean enabled = false;
        private String trustStore;
        private String certFile;
        private String keyFile;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getTrustStore() {
            return trustStore;
        }

        public void setTrustStore(String trustStore) {
            this.trustStore = trustStore;
        }

        public String getCertFile() {
            return certFile;
        }

        public void setCertFile(String certFile) {
            this.certFile = certFile;
        }

        public String getKeyFile() {
            return keyFile;
        }

        public void setKeyFile(String keyFile) {
            this.keyFile = keyFile;
        }
    }

    public static class Connection {
        private int timeout = 10;
        private int keepalive = 60;
        private boolean cleanSession = false;
        private boolean autoReconnect = true;
        private int maxReconnectInterval = 60;
        private int reconnectDelay = 5;

        public int getTimeout() {
            return timeout;
        }

        public void setTimeout(int timeout) {
            this.timeout = timeout;
        }

        public int getKeepalive() {
            return keepalive;
        }

        public void setKeepalive(int keepalive) {
            this.keepalive = keepalive;
        }

        public boolean isCleanSession() {
            return cleanSession;
        }

        public void setCleanSession(boolean cleanSession) {
            this.cleanSession = cleanSession;
        }

        public boolean isAutoReconnect() {
            return autoReconnect;
        }

        public void setAutoReconnect(boolean autoReconnect) {
            this.autoReconnect = autoReconnect;
        }

        public int getMaxReconnectInterval() {
            return maxReconnectInterval;
        }

        public void setMaxReconnectInterval(int maxReconnectInterval) {
            this.maxReconnectInterval = maxReconnectInterval;
        }

        public int getReconnectDelay() {
            return reconnectDelay;
        }

        public void setReconnectDelay(int reconnectDelay) {
            this.reconnectDelay = reconnectDelay;
        }
    }
}
package com.smartharvester.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "mqtt")
public class MqttProperties {
    
    private String broker;
    private String clientId;
    private String username;
    private String password;
    private int qos = 1;
    private List<String> topics = new ArrayList<>();
    
    private Ssl ssl = new Ssl();
    private Connection connection = new Connection();
    
    public String getBroker() {
        return broker;
    }
    
    public void setBroker(String broker) {
        this.broker = broker;
    }
    
    public String getClientId() {
        return clientId;
    }
    
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public int getQos() {
        return qos;
    }
    
    public void setQos(int qos) {
        this.qos = qos;
    }
    
    public List<String> getTopics() {
        return topics;
    }
    
    public void setTopics(List<String> topics) {
        this.topics = topics;
    }
    
    public Ssl getSsl() {
        return ssl;
    }
    
    public void setSsl(Ssl ssl) {
        this.ssl = ssl;
    }
    
    public Connection getConnection() {
        return connection;
    }
    
    public void setConnection(Connection connection) {
        this.connection = connection;
    }
    
    public static class Ssl {
        private boolean enabled = false;
        private String trustStore;
        private String certFile;
        private String keyFile;
        
        public boolean isEnabled() {
            return enabled;
        }
        
        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
        
        public String getTrustStore() {
            return trustStore;
        }
        
        public void setTrustStore(String trustStore) {
            this.trustStore = trustStore;
        }
        
        public String getCertFile() {
            return certFile;
        }
        
        public void setCertFile(String certFile) {
            this.certFile = certFile;
        }
        
        public String getKeyFile() {
            return keyFile;
        }
        
        public void setKeyFile(String keyFile) {
            this.keyFile = keyFile;
        }
    }
    
    public static class Connection {
        private int timeout = 10;
        private int keepalive = 60;
        private boolean cleanSession = false;
        private boolean autoReconnect = true;
        private int maxReconnectInterval = 60;
        private int reconnectDelay = 5;
        
        public int getTimeout() {
            return timeout;
        }
        
        public void setTimeout(int timeout) {
            this.timeout = timeout;
        }
        
        public int getKeepalive() {
            return keepalive;
        }
        
        public void setKeepalive(int keepalive) {
            this.keepalive = keepalive;
        }
        
        public boolean isCleanSession() {
            return cleanSession;
        }
        
        public void setCleanSession(boolean cleanSession) {
            this.cleanSession = cleanSession;
        }
        
        public boolean isAutoReconnect() {
            return autoReconnect;
        }
        
        public void setAutoReconnect(boolean autoReconnect) {
            this.autoReconnect = autoReconnect;
        }
        
        public int getMaxReconnectInterval() {
            return maxReconnectInterval;
        }
        
        public void setMaxReconnectInterval(int maxReconnectInterval) {
            this.maxReconnectInterval = maxReconnectInterval;
        }
        
        public int getReconnectDelay() {
            return reconnectDelay;
        }
        
        public void setReconnectDelay(int reconnectDelay) {
            this.reconnectDelay = reconnectDelay;
        }
    }
}
