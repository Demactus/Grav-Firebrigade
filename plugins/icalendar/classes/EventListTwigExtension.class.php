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
		foreach ($cal->getSortedEvents() as $r) {
			// DONE: include URL !
			if (((int) $r['DTSTART']->format('U')) > $today)	{
                // Extract the first word from SUMMARY
                $firstWord = rtrim(strtok($r['SUMMARY'], ' '), ':');

                $icon;
                // set icon variable
                switch ($firstWord) {
                    case 'Ausbildung':
                        $icon = 'fa-chalkboard-teacher';
                        break;
                    case 'Einsatzabteilung':
                        $icon = 'fa-fire';
                        break;
                    case 'Jugendfeuerwehr':
                        $icon = 'fa-hard-hat';
                        break;
                    case 'Feuerwehrverein':
                        $icon = 'fa-fire-alt';
                        break;
                    default:
                        $icon = 'fa-calendar';
                        break;
                }

                // Remove the first word and colon from the SUMMARY
                $cleanSummary = preg_replace('/^' . preg_quote($firstWord . ':', '/') . '\s*/', '', $r['SUMMARY']);

                // Create the summary link with URL if it exists
                $summaryLink = isset($r['URL']) ? sprintf('<a href="%s" target="_blank">%s</a>', $r['URL'], $cleanSummary) : $cleanSummary;


                // Build the event HTML with the dynamic class
                $eventList .= '<div class="event ' . htmlspecialchars($firstWord) . '">' . PHP_EOL;
                $eventList .= '    <a class="event-summary"><i class="fa '. $icon .'"></i>' . $summaryLink . '</a>' . PHP_EOL;
                $eventList .= '    <p class="event-date">' . $r['DTSTART']->format('d. F | H:i - ') . $r['DTEND']->format('H:i') . ' Uhr</p>' . PHP_EOL;
                $eventList .= '</div>' . PHP_EOL;

				$i++;
			}
			if ($i >= $this->numevents)	{ break; }	
		}
		return $eventList;
    }
}
?>
