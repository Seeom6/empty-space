export enum ScheduleRecurrence {
    EVERY_MINUTE = "* * * * *",        
    EVERY_5_MINUTES = "*/5 * * * *",    
    EVERY_15_MINUTES = "*/15 * * * *",  
    EVERY_30_MINUTES = "*/30 * * * *",  
    HOURLY = "0 * * * *",             
    DAILY = "0 0 * * *",       
    WEEKLY = "0 0 * * 0",             
    MONTHLY = "0 0 1 * *",            
    YEARLY = "0 0 1 1 *",             
}