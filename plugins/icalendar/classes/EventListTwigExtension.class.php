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
                $summaryLink = isset($r['URL']) ? sprintf('<a href="%s" target="_blank">%s</a>', $r['URL'], $r['SUMMARY']) : $r['SUMMARY'];

                $eventList .= '<div class="event">' . PHP_EOL;
                $eventList .= '    <a class="event-summary">' . $summaryLink . '</a>' . PHP_EOL;
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
