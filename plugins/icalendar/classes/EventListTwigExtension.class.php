<?php
namespace Grav\Plugin;
use Grav\Common\Plugin;
use RocketTheme\Toolbox\File\File;


class EventListTwigExtension extends \Twig_Extension
{
    private $numevents = 1;
    public function setNumEvents($numevents) { 
        $this->numevents = $numevents; 
    }
    private $ICSfile = NULL;
    public function setICSfile($icsfile) { 
        $this->ICSfile = $icsfile; 
    }
    private $dateformat = 'd.m.Y';
	public function setDateFormat($dateformat) { 
        $this->dateformat = $dateformat; 
    }
    public function getName()
    {
        return 'EventListTwigExtension';
    }
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('eventlist', [$this, 'eventFunction'])
        ];
    }
    public function eventFunction()
    {
		require_once __DIR__ . '/../vendor/autoload.php';
        $cal = new \om\IcalParser();
        if (! file_exists($this->ICSfile))	return NULL;
		$results = $cal->parseFile($this->ICSfile	);
		$eventList = '';
		$i = 0;
		// DONE: start list Today (not oldest Event)
		$today = (int) date('U');	// seconds since 01.01.1970

        // Month names mapping (German example)
        $monthNames = [
            1 => 'Januar', 2 => 'Februar', 3 => 'März', 4 => 'April',
            5 => 'Mai', 6 => 'Juni', 7 => 'Juli', 8 => 'August',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Dezember'
        ];

		foreach ($cal->getSortedEvents() as $r) {
			// DONE: include URL !
			if (((int) $r['DTSTART']->format('U')) > $today)	{
                // Extract the first word from SUMMARY
                $firstWord = rtrim(strtok($r['SUMMARY'], ' '), ':');

                // set icon variable
                switch ($firstWord) {
                    case 'Ausbildung':
                        $icon = 'fa-chalkboard-teacher fa-lg';
                        break;
                    case 'Einsatzabteilung':
                        $icon = 'fa-fire fa-lg';
                        break;
                    case 'Jugendfeuerwehr':
                        $icon = 'fa-hard-hat fa-lg';
                        break;
                    case 'Feuerwehrverein':
                        $icon = 'fa-fire-alt fa-lg';
                        break;
                    default:
                        $icon = 'fa-calendar fa-lg';
                        break;
                }

                // Remove the first word and colon from the SUMMARY
                $cleanSummary = preg_replace('/^' . preg_quote($firstWord . ':', '/') . '\s*/', '', $r['SUMMARY']);

                // Create the summary link with URL if it exists
                $summaryLink = isset($r['URL']) ? sprintf('<a href="%s" target="_blank">%s</a>', $r['URL'], $cleanSummary) : $cleanSummary;

                // Check if full day event
                $startHour = $r['DTSTART']->format('H');
                $startMinute = $r['DTSTART']->format('i');
                $endHour = $r['DTEND']->format('H');
                $endMinute = $r['DTEND']->format('i');
                $isFullDay = $startHour == $endHour && $startMinute == $endMinute;

                // Get the day and month
                $day = $r['DTSTART']->format('d');
                $monthNumber = (int) $r['DTSTART']->format('m');
                $monthName = $monthNames[$monthNumber];

                // Build the event HTML with the dynamic class
                $eventList .= '<div class="event ' . htmlspecialchars($firstWord) . '">' . PHP_EOL;
                $eventList .= '<i class="fa '. $icon .'"></i> '  . $summaryLink .  PHP_EOL;
                $eventList .= ($isFullDay) ? '    <p class="event-date">' . $day . '. ' . $monthName . '</p>' . PHP_EOL : '    <p class="event-date">' . $day . '. ' . $monthName . ' | ' . $startHour . ':' . $startMinute . ' - ' . $endHour . ':' . $endMinute . ' Uhr</p>' . PHP_EOL;
                $eventList .= '</div>' . PHP_EOL;

				$i++;
			}
			if ($i >= $this->numevents)	{ break; }	
		}
		return $eventList;
    }
}
?>
