import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';

class NotificationService {
  public async requestPermissions() {
    await notifee.requestPermission();
  }

  public async createDefaultChannel() {
    await notifee.createChannel({
      id: 'default',
      name: 'Habit Reminders',
      importance: AndroidImportance.HIGH,
    });
  }

  public async displayImmediate(title: string, body: string, id?: string) {
    await notifee.displayNotification({
      id,
      title,
      body,
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
      },
    });
  }

  public async scheduleDaily(id: string, title: string, body: string, hour: number, minute: number) {
    const date = new Date(Date.now());
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(0);

    // If time is in the past, schedule for tomorrow
    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: 1, // Repeat daily
    };

    await notifee.createTriggerNotification(
      {
        id,
        title,
        body,
        android: {
          channelId: 'default',
          pressAction: { id: 'default' },
        },
      },
      trigger
    );
  }

  public async cancel(id: string) {
    await notifee.cancelNotification(id);
  }
}

export const notificationService = new NotificationService();
