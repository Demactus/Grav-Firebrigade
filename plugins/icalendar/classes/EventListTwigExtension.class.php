<?php
namespace Grav\Plugin;
use Grav\Common\Plugin;
use RocketTheme\Toolbox\File\File;


class EventListTwigExtension extends \Twig_Extension
{

    function debug_to_console($data) {
        $output = $data;
        if (is_array($output))
            $output = implode(',', $output);

        echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
    }
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

    /**
     * Format DateTime with utc if TZID is set as datetime is already correct format then
     *
     * @param \DateTime $dateTime
     * @param string|null $tzid
     * @return \DateTime
     */
    public function formatDateTime(\DateTime $dateTime, ?string $tzid = null): \DateTime {
        if ($tzid) {
            try {
                $timezone = new \DateTimeZone('UTC');
                $dateTime->setTimezone($timezone);
            } catch (\Exception $e) {
                // Handle exception if the timezone is invalid
            }
        }
        return $dateTime;
    }

    public function eventFunction() {
		require_once __DIR__ . '/../vendor/autoload.php';
        $cal = new \om\IcalParser();
        if (! file_exists($this->ICSfile))	return NULL;
		$icsResults = $cal->parseFile($this->ICSfile);
        $icsEvents = $cal->getEvents();
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

		foreach ($icsEvents->sorted() as $r) {
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
                    case 'Kinderfeuerwehr':
                        $icon = 'fa-shapes fa-lg';
                        break;
                    default:
                        $icon = 'fa-calendar fa-lg';
                        break;
                }

                $formattedStartDate = $this->formatDateTime($r['DTSTART'], $r['TZID'] ?? null);
                $formattedEndDate = $this->formatDateTime($r['DTEND'], $r['TZID']?? null);

                // Remove the first word and colon from the SUMMARY
                $cleanSummary = preg_replace('/^' . preg_quote($firstWord . ':', '/') . '\s*/', '', $r['SUMMARY']);

                // Create the summary link with URL if it exists
                $summaryLink = isset($r['URL']) ? sprintf('<a href="%s" target="_blank">%s</a>', $r['URL'], $cleanSummary) : $cleanSummary;

                // Check if full day event
                $startHour = $formattedStartDate->format('H');
                $startMinute = $formattedStartDate->format('i');
                $endHour = $formattedEndDate->format('H');
                $endMinute = $formattedEndDate->format('i');
                $isFullDay = $startHour == $endHour && $startMinute == $endMinute;

                // Get the day and month
                $day = $r['DTSTART']->format('d');
                $monthNumber = (int) $r['DTSTART']->format('m');
                $monthName = $monthNames[$monthNumber];

                // Build the event HTML with the dynamic class
                $eventList .= '<div class="event ' . htmlspecialchars($firstWord) . '">' . PHP_EOL;
                $eventList .= '<i class="fa '. $icon .'"></i> ' . '<strong>'  . $summaryLink . '</strong>' . PHP_EOL;
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
